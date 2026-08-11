#include "agent.h"
#include "ai_types.h"
#include "imgui.h"
#include "nlohmann/json.hpp"
#include "ui_state.h"
#include "oauth_state.h"
#include "screenshot_state.h"

#include <windows.h>
#include <winhttp.h>
#include <shellapi.h>
#include <psapi.h>
#include <UIAutomation.h>
#include <comdef.h>

#include <algorithm>
#include <atomic>
#include <cctype>
#include <cstdio>
#include <cstring>
#include <mutex>
#include <memory>
#include <random>
#include <set>
#include <sstream>
#include <string>
#include <thread>
#include <unordered_map>
#include <unordered_set>
#include <vector>
#include <cstdint>
#include <iomanip>
#include <cstdlib>

#pragma comment(lib, "winhttp.lib")
#pragma comment(lib, "UIAutomationCore.lib")
#pragma comment(lib, "Ole32.lib")
#pragma comment(lib, "OleAut32.lib")
#pragma comment(lib, "Shell32.lib")
#pragma comment(lib, "psapi.lib")

using json = nlohmann::json;

static HWND g_agentWindow = NULL;
extern void CaptureScreenshot();
extern void SetClipboardText(const std::string& text);

extern std::vector<ProviderDef> g_providers;
extern int g_currProviderIdx;
extern int g_currModelIdx;
extern UserKeys g_apiKeys;

namespace Api {
    bool RefreshOAuth();
}

float CalculateInputBoxHeight(const std::string& buf, float availableWidth);
bool FloatingInputGhost(const char* id, const char* label, std::string& buf, FocusState myFocus, bool showSendButton, bool& outSendClicked, float fixedHeight = 0.0f);

namespace Api {
    void FetchModelsForProvider(AIProvider type);
}

namespace Agent {
namespace {

std::wstring s2ws(const std::string& s) {
    if (s.empty()) return L"";
    int len = MultiByteToWideChar(CP_UTF8, 0, s.c_str(), (int)s.size(), NULL, 0);
    std::wstring r(len, 0);
    MultiByteToWideChar(CP_UTF8, 0, s.c_str(), (int)s.size(), &r[0], len);
    return r;
}

std::string ws2s(const std::wstring& w) {
    if (w.empty()) return "";
    int len = WideCharToMultiByte(CP_UTF8, 0, w.c_str(), (int)w.size(), NULL, 0, NULL, NULL);
    std::string r(len, 0);
    WideCharToMultiByte(CP_UTF8, 0, w.c_str(), (int)w.size(), &r[0], len, NULL, NULL);
    return r;
}

static std::string Base64Decode(const std::string& in) {
    static const std::string base64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    std::string out;
    std::vector<int> T(256, -1);
    for (int i = 0; i < 64; i++) T[base64_chars[i]] = i;
    int val = 0, valb = -8;
    for (unsigned char c : in) {
        if (T[c] == -1) break;
        val = (val << 6) + T[c];
        valb += 6;
        if (valb >= 0) {
            out.push_back(char((val >> valb) & 0xFF));
            valb -= 8;
        }
    }
    return out;
}

std::string SseText(const std::string& s) {
    std::istringstream iss(s);
    std::string line;
    std::string out;
    while (std::getline(iss, line)) {
        if (line.rfind("data:", 0) != 0) continue;
        std::string data = line.substr(5);
        while (!data.empty() && (data[0] == ' ' || data[0] == '\t')) data.erase(data.begin());
        if (data == "[DONE]") break;
        if (!json::accept(data)) continue;
        auto j = json::parse(data);
        if (j.contains("type") && j["type"].is_string()) {
            std::string type = j["type"].get<std::string>();
            if (type == "response.output_text.delta" && j.contains("delta") && j["delta"].is_string()) {
                out += j["delta"].get<std::string>();
            }
            else if (type == "response.completed" && j.contains("response")) {
                const auto& r = j["response"];
                if (r.contains("output_text") && r["output_text"].is_string()) {
                    out = r["output_text"].get<std::string>();
                }
            }
        }
    }
    return out;
}

std::string CaselessFind(std::string data, std::string toSearch) {
    std::string dataLower = data;
    std::string searchLower = toSearch;
    std::transform(dataLower.begin(), dataLower.end(), dataLower.begin(), ::tolower);
    std::transform(searchLower.begin(), searchLower.end(), searchLower.begin(), ::tolower);
    if (dataLower.find(searchLower) != std::string::npos) return toSearch;
    return "";
}

std::string BstrToStdString(BSTR bstr) {
    if (!bstr) return "";
    int len = WideCharToMultiByte(CP_UTF8, 0, bstr, SysStringLen(bstr), NULL, 0, NULL, NULL);
    if (len <= 0) return "";
    std::string s(len, 0);
    WideCharToMultiByte(CP_UTF8, 0, bstr, SysStringLen(bstr), &s[0], len, NULL, NULL);
    return s;
}

std::string ToLowerCopy(std::string s) {
    std::transform(s.begin(), s.end(), s.begin(), [](unsigned char c) { return (char)std::tolower(c); });
    return s;
}

bool ContainsCaseInsensitive(const std::string& haystack, const std::string& needle) {
    if (needle.empty()) return false;
    std::string h = ToLowerCopy(haystack);
    std::string n = ToLowerCopy(needle);
    return h.find(n) != std::string::npos;
}

std::string ClipString(const std::string& s, size_t maxLen) {
    if (s.size() <= maxLen) return s;
    return s.substr(0, maxLen) + "...";
}

std::string Hash64Hex(const std::string& s) {
    const uint64_t fnvOffset = 1469598103934665603ULL;
    const uint64_t fnvPrime = 1099511628211ULL;
    uint64_t hash = fnvOffset;
    for (unsigned char c : s) {
        hash ^= c;
        hash *= fnvPrime;
    }
    std::ostringstream oss;
    oss << std::hex << std::setw(16) << std::setfill('0') << hash;
    return oss.str();
}

int QuantizeCoord(long v, int grid) {
    if (grid <= 0) return (int)v;
    return (int)(v / grid) * grid;
}

std::vector<std::string> ExtractKeywords(const std::string& text) {
    std::string lower = ToLowerCopy(text);
    for (char& c : lower) {
        if (!std::isalnum((unsigned char)c)) c = ' ';
    }
    std::vector<std::string> tokens;
    std::istringstream iss(lower);
    std::string tok;
    while (iss >> tok) {
        if (tok.size() < 3) continue;
        tokens.push_back(tok);
        if (tokens.size() >= 16) break;
    }
    return tokens;
}

bool GoalImpliesEditing(const std::string& goal) {
    std::string g = ToLowerCopy(goal);
    const char* keys[] = { "edit", "replace", "update", "change", "modify", "fix", "refactor", "rename", "write", "code", "implement", "delete", "remove", "insert", "add" };
    for (const auto& k : keys) {
        if (g.find(k) != std::string::npos) return true;
    }
    return false;
}

std::string TrimCopy(const std::string& s) {
    size_t start = s.find_first_not_of(" \t\n\r");
    if (start == std::string::npos) return "";
    size_t end = s.find_last_not_of(" \t\n\r");
    return s.substr(start, end - start + 1);
}

struct CoordinatorParallelRequest {
    bool valid = false;
    int workerCount = 0;
    std::string appExe;
    std::string task;
};

CoordinatorParallelRequest ParseCoordinatorParallelRequest(const std::string& goal) {
    CoordinatorParallelRequest req;
    std::string lower = ToLowerCopy(goal);
    size_t workerPos = lower.find("worker");
    if (workerPos == std::string::npos) return req;

    int count = 0;
    for (size_t i = 0; i < lower.size(); i++) {
        if (!std::isdigit((unsigned char)lower[i])) continue;
        size_t j = i;
        while (j < lower.size() && std::isdigit((unsigned char)lower[j])) j++;
        std::string num = lower.substr(i, j - i);
        int candidate = std::atoi(num.c_str());
        size_t nearWorker = lower.find("worker", i);
        if (candidate > 1 && nearWorker != std::string::npos && nearWorker - i < 20) {
            count = candidate;
            break;
        }
        i = j;
    }

    if (count < 2) return req;

    std::string appExe;
    if (lower.find("notepad") != std::string::npos) appExe = "notepad.exe";
    else if (lower.find("wordpad") != std::string::npos) appExe = "wordpad.exe";
    if (appExe.empty()) return req;

    std::string task = goal;
    size_t usingPos = lower.find(" using ");
    if (usingPos == std::string::npos) usingPos = lower.find(" with ");
    if (usingPos != std::string::npos) {
        task = TrimCopy(goal.substr(0, usingPos));
    }
    std::string taskLower = ToLowerCopy(task);
    size_t inNotepadPos = taskLower.find(" in notepad");
    if (inNotepadPos != std::string::npos) {
        task = TrimCopy(task.substr(0, inNotepadPos));
        taskLower = ToLowerCopy(task);
    }
    size_t onNotepadPos = taskLower.find(" on notepad");
    if (onNotepadPos != std::string::npos) {
        task = TrimCopy(task.substr(0, onNotepadPos));
    }
    if (task.empty()) task = "Write a short poem";

    req.valid = true;
    req.workerCount = count;
    req.appExe = appExe;
    req.task = task;
    return req;
}

bool IsInputDesktopActive() {
    HDESK hI = OpenInputDesktop(0, FALSE, DESKTOP_READOBJECTS);
    if (!hI) return false;
    HDESK hM = GetThreadDesktop(GetCurrentThreadId());
    bool isActive = false;
    if (hM) {
        auto GetN = [](HDESK h) {
            DWORD n = 0; GetUserObjectInformationW(h, UOI_NAME, NULL, 0, &n);
            std::wstring b(n / sizeof(wchar_t), 0); GetUserObjectInformationW(h, UOI_NAME, &b[0], n, &n);
            return b;
        };
        isActive = (GetN(hI) == GetN(hM));
    }
    CloseDesktop(hI);
    return isActive;
}

std::string AgentHttpRequest(const std::wstring& domain, const std::wstring& path, const std::string& method, const std::string& body, const std::vector<std::wstring>& customHeaders = {}) {
    HINTERNET hS = WinHttpOpen(L"Agent/1.0", WINHTTP_ACCESS_TYPE_DEFAULT_PROXY, NULL, NULL, 0);
    if (!hS) return "";
    HINTERNET hC = WinHttpConnect(hS, domain.c_str(), INTERNET_DEFAULT_HTTPS_PORT, 0);
    if (!hC) { WinHttpCloseHandle(hS); return ""; }

    HINTERNET hR = WinHttpOpenRequest(hC, s2ws(method).c_str(), path.c_str(), NULL, NULL, NULL, WINHTTP_FLAG_SECURE);

    if (method == "POST") {
        std::wstring h = L"Content-Type: application/json\r\n";
        WinHttpAddRequestHeaders(hR, h.c_str(), (DWORD)-1L, WINHTTP_ADDREQ_FLAG_ADD);
    }

    for (const auto& hdr : customHeaders) {
        WinHttpAddRequestHeaders(hR, hdr.c_str(), (DWORD)-1L, WINHTTP_ADDREQ_FLAG_ADD);
    }

    bool bResults = WinHttpSendRequest(hR, WINHTTP_NO_ADDITIONAL_HEADERS, 0, (LPVOID)body.c_str(), (DWORD)body.length(), (DWORD)body.length(), 0);

    std::string res = "";
    if (bResults && WinHttpReceiveResponse(hR, NULL)) {
        DWORD dwS = 0, dwD = 0;
        do {
            WinHttpQueryDataAvailable(hR, &dwS);
            if (!dwS) break;
            std::vector<char> b(dwS + 1);
            if (WinHttpReadData(hR, b.data(), dwS, &dwD)) {
                b[dwD] = 0;
                res.append(b.data());
            }
        } while (dwS > 0);
    }

    WinHttpCloseHandle(hR); WinHttpCloseHandle(hC); WinHttpCloseHandle(hS);
    return res;
}

std::string AgentHttpOllama(const std::string& method, const std::wstring& path, const std::string& body) {
    HINTERNET hS = WinHttpOpen(L"Agent/Ollama", WINHTTP_ACCESS_TYPE_DEFAULT_PROXY, NULL, NULL, 0);
    if (!hS) return "";
    HINTERNET hC = WinHttpConnect(hS, L"localhost", 11434, 0);
    if (!hC) { WinHttpCloseHandle(hS); return ""; }

    HINTERNET hR = WinHttpOpenRequest(hC, s2ws(method).c_str(), path.c_str(), NULL, NULL, NULL, 0);

    bool bResults = WinHttpSendRequest(hR, WINHTTP_NO_ADDITIONAL_HEADERS, 0, (LPVOID)body.c_str(), (DWORD)body.length(), (DWORD)body.length(), 0);
    std::string res = "";
    if (bResults && WinHttpReceiveResponse(hR, NULL)) {
        DWORD dwS = 0, dwD = 0;
        do {
            WinHttpQueryDataAvailable(hR, &dwS);
            if (!dwS) break;
            std::vector<char> b(dwS + 1);
            if (WinHttpReadData(hR, b.data(), dwS, &dwD)) { b[dwD] = 0; res.append(b.data()); }
        } while (dwS > 0);
    }
    WinHttpCloseHandle(hR); WinHttpCloseHandle(hC); WinHttpCloseHandle(hS);
    return res;
}

struct ProcessInfo {
    DWORD pid;
    HWND hwnd;
    std::string title;
    std::string processName;
};

std::vector<ProcessInfo> g_processList;
std::mutex g_processListMutex;
HWND g_targetWindow = NULL;
std::string g_targetProcessName = "None";
std::string g_lastActionResult = "";
bool g_showProcessSelector = false;

std::atomic<int> g_runningAgentCount(0);
std::mutex g_actionExecMutex;

BOOL CALLBACK EnumWindowsProc(HWND hwnd, LPARAM lParam) {
    if (!IsWindowVisible(hwnd) || GetWindowTextLength(hwnd) == 0) return TRUE;
    if (hwnd == g_agentWindow || hwnd == GetShellWindow()) return TRUE;

    LONG_PTR style = GetWindowLongPtr(hwnd, GWL_STYLE);
    LONG_PTR exStyle = GetWindowLongPtr(hwnd, GWL_EXSTYLE);
    if (style & WS_CHILD) return TRUE;
    if (exStyle & WS_EX_TOOLWINDOW) return TRUE;
    if (GetWindow(hwnd, GW_OWNER) != NULL) return TRUE;

    DWORD pid;
    GetWindowThreadProcessId(hwnd, &pid);

    char title[256];
    GetWindowTextA(hwnd, title, sizeof(title));

    char processName[MAX_PATH] = "<unknown>";
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, pid);
    if (hProcess) {
        HMODULE hMod;
        DWORD cbNeeded;
        if (EnumProcessModules(hProcess, &hMod, sizeof(hMod), &cbNeeded)) {
            GetModuleBaseNameA(hProcess, hMod, processName, sizeof(processName));
        }
        CloseHandle(hProcess);
    }

    auto* out = (std::vector<ProcessInfo>*)lParam;
    if (out) out->push_back({ pid, hwnd, title, processName });
    return TRUE;
}

void RefreshProcessList() {
    std::vector<ProcessInfo> next;
    EnumWindows(EnumWindowsProc, (LPARAM)&next);
    std::lock_guard<std::mutex> lock(g_processListMutex);
    g_processList = std::move(next);
}

std::vector<ProcessInfo> GetProcessListSnapshot() {
    std::lock_guard<std::mutex> lock(g_processListMutex);
    return g_processList;
}

bool GetProcessByIndex(int oneBasedIndex, ProcessInfo& out) {
    std::lock_guard<std::mutex> lock(g_processListMutex);
    if (oneBasedIndex < 1 || oneBasedIndex > (int)g_processList.size()) return false;
    out = g_processList[(size_t)oneBasedIndex - 1];
    return true;
}

std::string GetProcessNameByPid(DWORD pid) {
    char processName[MAX_PATH] = "<unknown>";
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, pid);
    if (hProcess) {
        HMODULE hMod;
        DWORD cbNeeded = 0;
        if (EnumProcessModules(hProcess, &hMod, sizeof(hMod), &cbNeeded)) {
            GetModuleBaseNameA(hProcess, hMod, processName, sizeof(processName));
        }
        CloseHandle(hProcess);
    }
    return processName;
}

bool IsUsableAppWindow(HWND hwnd) {
    if (!hwnd || !IsWindow(hwnd)) return false;
    if (!IsWindowVisible(hwnd) || GetWindowTextLength(hwnd) == 0) return false;
    if (hwnd == g_agentWindow || hwnd == GetShellWindow()) return false;
    LONG_PTR style = GetWindowLongPtr(hwnd, GWL_STYLE);
    LONG_PTR exStyle = GetWindowLongPtr(hwnd, GWL_EXSTYLE);
    if (style & WS_CHILD) return false;
    if (exStyle & WS_EX_TOOLWINDOW) return false;
    if (GetWindow(hwnd, GW_OWNER) != NULL) return false;
    DWORD pid = 0;
    GetWindowThreadProcessId(hwnd, &pid);
    if (pid == GetCurrentProcessId()) return false;
    return true;
}

HWND FindFirstWindowForPid(DWORD pid) {
    if (pid == 0) return NULL;
    struct FindByPidCtx {
        DWORD pid;
        HWND hwnd;
    };
    FindByPidCtx ctx = { pid, NULL };
    EnumWindows([](HWND hwnd, LPARAM lp) -> BOOL {
        auto* c = (FindByPidCtx*)lp;
        DWORD wpid = 0;
        GetWindowThreadProcessId(hwnd, &wpid);
        if (wpid != c->pid) return TRUE;
        if (!IsUsableAppWindow(hwnd)) return TRUE;
        c->hwnd = hwnd;
        return FALSE;
        }, (LPARAM)&ctx);
    if (ctx.hwnd) return ctx.hwnd;
    return NULL;
}

bool LaunchAppAndAttachWindow(const std::string& appExe, HWND& outWindow, std::string& outProcessName, DWORD timeoutMs = 12000) {
    outWindow = NULL;
    outProcessName.clear();
    if (appExe.empty()) return false;

    STARTUPINFOA si = {};
    si.cb = sizeof(si);
    PROCESS_INFORMATION pi = {};

    std::vector<char> cmdLine(appExe.begin(), appExe.end());
    cmdLine.push_back('\0');

    BOOL created = CreateProcessA(NULL, cmdLine.data(), NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi);
    DWORD pid = 0;
    if (created) {
        pid = pi.dwProcessId;
        CloseHandle(pi.hThread);
        CloseHandle(pi.hProcess);
    }
    else {
        HINSTANCE sh = ShellExecuteA(NULL, "open", appExe.c_str(), NULL, NULL, SW_SHOW);
        if ((INT_PTR)sh <= 32) return false;
    }

    DWORD start = GetTickCount();
    while (GetTickCount() - start < timeoutMs) {
        if (pid != 0) {
            HWND hwnd = FindFirstWindowForPid(pid);
            if (hwnd) {
                outWindow = hwnd;
                outProcessName = GetProcessNameByPid(pid);
                return true;
            }
        }
        else {
            RefreshProcessList();
            auto list = GetProcessListSnapshot();
            for (const auto& p : list) {
                std::string lowerProc = ToLowerCopy(p.processName);
                std::string lowerExe = ToLowerCopy(appExe);
                if (lowerProc.find(lowerExe) != std::string::npos || lowerExe.find(lowerProc) != std::string::npos) {
                    outWindow = p.hwnd;
                    outProcessName = p.processName;
                    return true;
                }
            }
        }
        Sleep(120);
    }
    return false;
}

std::mutex g_agentMutex;
std::atomic<bool> g_agentExecuting(false);

std::string g_telegramToken = "";
std::string g_telegramChatId = "";
bool g_telegramEnabled = false;
int g_telegramLastUpdateId = 0;
bool g_telegramPolling = false;
bool g_telegramScreenshotWarned = false;

enum class TelegramState { Idle, WaitingForAppSelection };
TelegramState g_telegramState = TelegramState::Idle;
std::string g_telegramInputBuffer = "";
bool g_telegramInputReady = false;
std::mutex g_telegramMutex;

void TelegramProcessCommandImpl(const std::string& chatId, const std::string& text);

class TelegramBridge {
public:
    static bool SendMessage(const std::string& text) {
        if (g_telegramToken.empty() || g_telegramChatId.empty()) return false;
        std::string url = "/bot" + g_telegramToken + "/sendMessage";
        json body;
        body["chat_id"] = g_telegramChatId;
        body["text"] = text;
        std::string payload = body.dump();
        return HttpPost("api.telegram.org", url, payload);
    }

    static bool SendPhotoJpegBytes(const std::vector<uint8_t>& jpegBytes, const std::string& caption) {
        if (g_telegramToken.empty() || g_telegramChatId.empty()) return false;
        if (jpegBytes.empty()) return false;

        std::string path = "/bot" + g_telegramToken + "/sendPhoto";
        std::string boundary = "----AgentBoundary" + std::to_string(GetTickCount64());

        auto AppendStr = [](std::vector<uint8_t>& out, const std::string& s) {
            out.insert(out.end(), (const uint8_t*)s.data(), (const uint8_t*)s.data() + s.size());
        };
        auto AppendBytes = [](std::vector<uint8_t>& out, const std::vector<uint8_t>& b) {
            out.insert(out.end(), b.begin(), b.end());
        };

        std::vector<uint8_t> body;
        AppendStr(body, "--" + boundary + "\r\n");
        AppendStr(body, "Content-Disposition: form-data; name=\"chat_id\"\r\n\r\n");
        AppendStr(body, g_telegramChatId + "\r\n");

        if (!caption.empty()) {
            AppendStr(body, "--" + boundary + "\r\n");
            AppendStr(body, "Content-Disposition: form-data; name=\"caption\"\r\n\r\n");
            AppendStr(body, caption + "\r\n");
        }

        AppendStr(body, "--" + boundary + "\r\n");
        AppendStr(body, "Content-Disposition: form-data; name=\"photo\"; filename=\"step.jpg\"\r\n");
        AppendStr(body, "Content-Type: image/jpeg\r\n\r\n");
        AppendBytes(body, jpegBytes);
        AppendStr(body, "\r\n");
        AppendStr(body, "--" + boundary + "--\r\n");

        std::wstring ct = L"Content-Type: multipart/form-data; boundary=" + s2ws(boundary);
        return HttpPostRaw("api.telegram.org", path, ct, body);
    }

    static std::vector<std::pair<std::string, std::string>> PollUpdates() {
        std::vector<std::pair<std::string, std::string>> messages;
        if (g_telegramToken.empty()) return messages;
        std::string url = "/bot" + g_telegramToken + "/getUpdates?timeout=5&offset=" + std::to_string(g_telegramLastUpdateId + 1);
        std::string response = HttpGet("api.telegram.org", url);
        if (response.empty()) return messages;
        try {
            auto j = json::parse(response);
            if (j.contains("ok") && j["ok"].get<bool>() && j.contains("result")) {
                for (auto& update : j["result"]) {
                    int updateId = update.value("update_id", 0);
                    if (updateId > g_telegramLastUpdateId) g_telegramLastUpdateId = updateId;
                    if (update.contains("message") && update["message"].contains("text")) {
                        std::string chatId = std::to_string(update["message"]["chat"].value("id", (int64_t)0));
                        auto& msg = update["message"];
                        if (msg.contains("from") && msg["from"].value("is_bot", false)) {
                            continue;
                        }
                        std::string text = msg["text"].get<std::string>();
                        if (g_telegramChatId.empty() || chatId == g_telegramChatId) {
                            messages.push_back({ chatId, text });
                        }
                    }
                }
            }
        } catch (...) {}
        return messages;
    }

    static void ProcessCommand(const std::string& chatId, const std::string& text) {
        TelegramProcessCommandImpl(chatId, text);
    }

        static void StartPolling() {
            if (g_telegramPolling) return;
            g_telegramPolling = true;
            std::thread([]() {
                // Clear any backlog so old commands do not replay
                PollUpdates();
                SendMessage("[OK] Agent is online and ready!");
                while (g_telegramPolling && g_telegramEnabled) {
                    auto messages = PollUpdates();
                    for (auto& msg : messages) {
                        ProcessCommand(msg.first, msg.second);
                }
                Sleep(1500);
            }
            g_telegramPolling = false;
        }).detach();
    }

    static void StopPolling() { g_telegramPolling = false; }

private:
    static std::string HttpGet(const std::string& host, const std::string& path) {
        std::string result;
        HINTERNET hSession = WinHttpOpen(L"TelegramBridge/1.0", WINHTTP_ACCESS_TYPE_DEFAULT_PROXY, NULL, NULL, 0);
        if (!hSession) return result;
        std::wstring wHost(host.begin(), host.end());
        HINTERNET hConnect = WinHttpConnect(hSession, wHost.c_str(), INTERNET_DEFAULT_HTTPS_PORT, 0);
        if (!hConnect) { WinHttpCloseHandle(hSession); return result; }
        std::wstring wPath(path.begin(), path.end());
        HINTERNET hRequest = WinHttpOpenRequest(hConnect, L"GET", wPath.c_str(), NULL, NULL, NULL, WINHTTP_FLAG_SECURE);
        if (!hRequest) { WinHttpCloseHandle(hConnect); WinHttpCloseHandle(hSession); return result; }
        if (WinHttpSendRequest(hRequest, NULL, 0, NULL, 0, 0, 0) && WinHttpReceiveResponse(hRequest, NULL)) {
            DWORD dwSize = 0;
            do {
                dwSize = 0;
                WinHttpQueryDataAvailable(hRequest, &dwSize);
                if (dwSize > 0) {
                    std::vector<char> buf(dwSize + 1, 0);
                    DWORD dwRead = 0;
                    WinHttpReadData(hRequest, buf.data(), dwSize, &dwRead);
                    result.append(buf.data(), dwRead);
                }
            } while (dwSize > 0);
        }
        WinHttpCloseHandle(hRequest); WinHttpCloseHandle(hConnect); WinHttpCloseHandle(hSession);
        return result;
    }

    static bool HttpPost(const std::string& host, const std::string& path, const std::string& jsonBody) {
        HINTERNET hSession = WinHttpOpen(L"TelegramBridge/1.0", WINHTTP_ACCESS_TYPE_DEFAULT_PROXY, NULL, NULL, 0);
        if (!hSession) return false;
        std::wstring wHost(host.begin(), host.end());
        HINTERNET hConnect = WinHttpConnect(hSession, wHost.c_str(), INTERNET_DEFAULT_HTTPS_PORT, 0);
        if (!hConnect) { WinHttpCloseHandle(hSession); return false; }
        std::wstring wPath(path.begin(), path.end());
        HINTERNET hRequest = WinHttpOpenRequest(hConnect, L"POST", wPath.c_str(), NULL, NULL, NULL, WINHTTP_FLAG_SECURE);
        if (!hRequest) { WinHttpCloseHandle(hConnect); WinHttpCloseHandle(hSession); return false; }
        LPCWSTR contentType = L"Content-Type: application/json";
        bool ok = WinHttpSendRequest(hRequest, contentType, -1, (LPVOID)jsonBody.c_str(), (DWORD)jsonBody.size(), (DWORD)jsonBody.size(), 0)
            && WinHttpReceiveResponse(hRequest, NULL);
        WinHttpCloseHandle(hRequest); WinHttpCloseHandle(hConnect); WinHttpCloseHandle(hSession);
        return ok;
    }

    static bool HttpPostRaw(const std::string& host, const std::string& path, const std::wstring& contentType, const std::vector<uint8_t>& body) {
        HINTERNET hSession = WinHttpOpen(L"TelegramBridge/1.0", WINHTTP_ACCESS_TYPE_DEFAULT_PROXY, NULL, NULL, 0);
        if (!hSession) return false;
        std::wstring wHost(host.begin(), host.end());
        HINTERNET hConnect = WinHttpConnect(hSession, wHost.c_str(), INTERNET_DEFAULT_HTTPS_PORT, 0);
        if (!hConnect) { WinHttpCloseHandle(hSession); return false; }
        std::wstring wPath(path.begin(), path.end());
        HINTERNET hRequest = WinHttpOpenRequest(hConnect, L"POST", wPath.c_str(), NULL, NULL, NULL, WINHTTP_FLAG_SECURE);
        if (!hRequest) { WinHttpCloseHandle(hConnect); WinHttpCloseHandle(hSession); return false; }

        bool ok = WinHttpSendRequest(
            hRequest,
            contentType.c_str(),
            (DWORD)-1L,
            (LPVOID)(body.empty() ? NULL : body.data()),
            (DWORD)body.size(),
            (DWORD)body.size(),
            0
        ) && WinHttpReceiveResponse(hRequest, NULL);

        WinHttpCloseHandle(hRequest); WinHttpCloseHandle(hConnect); WinHttpCloseHandle(hSession);
        return ok;
    }
};

static bool SendStepScreenshot(const std::string& caption) {
    if (!g_telegramEnabled || !g_telegramPolling) return false;

    CaptureScreenshot();
    if (g_screenshots.empty()) {
        if (!g_telegramScreenshotWarned) {
            TelegramBridge::SendMessage("[SCREENSHOT] Unavailable (screen hidden/black). Proceeding with UI inspection.");
            g_telegramScreenshotWarned = true;
        }
        return false;
    }

    const auto& img = g_screenshots.back();
    std::string raw = Base64Decode(img.base64Data);
    if (raw.empty()) {
        if (!g_telegramScreenshotWarned) {
            TelegramBridge::SendMessage("[SCREENSHOT] Capture failed. Proceeding with UI inspection.");
            g_telegramScreenshotWarned = true;
        }
        return false;
    }

    std::vector<uint8_t> jpg(raw.begin(), raw.end());
    return TelegramBridge::SendPhotoJpegBytes(jpg, caption);
}

struct AgentElement {
    std::string name;
    std::string controlType;
    std::string automationId;
    std::string value;
    std::string labeledBy;
    long x, y, w, h;
    std::vector<std::string> patterns;
    std::vector<AgentElement> children;
};

struct NodeSnapshot {
    std::string id;
    std::string name;
    std::string controlType;
    std::string automationId;
    std::string value;
    std::string labeledBy;
    long x = 0;
    long y = 0;
    long w = 0;
    long h = 0;
    std::vector<std::string> patterns;
    std::vector<std::string> childrenIds;
    std::string parentId;
};

struct UiSnapshot {
    std::unordered_map<std::string, NodeSnapshot> nodes;
    std::string rootId;
};

struct UiDiffResult {
    json diffJson;
    size_t changedCount = 0;
    std::unordered_set<std::string> changedIds;
};

struct ContextBuildResult {
    json contextJson;
    std::unordered_set<std::string> includeIds;
    std::unordered_map<std::string, float> scores;
};

struct UiPromptPayload {
    std::string diff;
    std::string context;
    std::string fullTree;
    std::string adjacency;
    bool usedFullTree = false;
    bool includeAdjacency = false;
};

static int g_agentTreeElementCount = 0;

std::string ControlTypeIdToString(CONTROLTYPEID cType) {
    switch (cType) {
    case UIA_ButtonControlTypeId: return "Button";
    case UIA_EditControlTypeId: return "Edit";
    case UIA_WindowControlTypeId: return "Window";
    case UIA_ListControlTypeId: return "List";
    case UIA_ListItemControlTypeId: return "ListItem";
    case UIA_CheckBoxControlTypeId: return "CheckBox";
    case UIA_ComboBoxControlTypeId: return "ComboBox";
    case UIA_DocumentControlTypeId: return "Document";
    case UIA_TextControlTypeId: return "Text";
    case UIA_HyperlinkControlTypeId: return "Hyperlink";
    case UIA_MenuItemControlTypeId: return "MenuItem";
    case UIA_MenuControlTypeId: return "Menu";
    case UIA_MenuBarControlTypeId: return "MenuBar";
    case UIA_TabControlTypeId: return "Tab";
    case UIA_TabItemControlTypeId: return "TabItem";
    case UIA_TreeControlTypeId: return "Tree";
    case UIA_TreeItemControlTypeId: return "TreeItem";
    case UIA_ToolBarControlTypeId: return "ToolBar";
    case UIA_RadioButtonControlTypeId: return "RadioButton";
    case UIA_ScrollBarControlTypeId: return "ScrollBar";
    case UIA_SliderControlTypeId: return "Slider";
    case UIA_ProgressBarControlTypeId: return "ProgressBar";
    case UIA_GroupControlTypeId: return "Group";
    case UIA_PaneControlTypeId: return "Pane";
    case UIA_DataGridControlTypeId: return "DataGrid";
    case UIA_DataItemControlTypeId: return "DataItem";
    case UIA_StatusBarControlTypeId: return "StatusBar";
    case UIA_HeaderControlTypeId: return "Header";
    case UIA_SplitButtonControlTypeId: return "SplitButton";
    case UIA_SpinnerControlTypeId: return "Spinner";
    case UIA_ImageControlTypeId: return "Image";
    case UIA_TitleBarControlTypeId: return "TitleBar";
    default: return "Other";
    }
}

bool IsActionableControlType(const std::string& controlType) {
    return controlType == "Button" || controlType == "Edit" || controlType == "ListItem" ||
        controlType == "Hyperlink" || controlType == "MenuItem" || controlType == "CheckBox" ||
        controlType == "ComboBox" || controlType == "RadioButton" || controlType == "TabItem" ||
        controlType == "TreeItem";
}

bool HasActionablePattern(const NodeSnapshot& node) {
    for (const auto& p : node.patterns) {
        if (p == "Invoke" || p == "Value" || p == "SelectionItem" || p == "ExpandCollapse" || p == "Toggle") return true;
    }
    return false;
}

std::string BuildNodeKey(const AgentElement& node) {
    int qx = QuantizeCoord(node.x, 10);
    int qy = QuantizeCoord(node.y, 10);
    int qw = QuantizeCoord(node.w, 10);
    int qh = QuantizeCoord(node.h, 10);
    std::ostringstream oss;
    oss << node.automationId << "|" << node.controlType << "|" << node.name << "|" << node.labeledBy
        << "|" << qx << "," << qy << "," << qw << "," << qh;
    return oss.str();
}

std::string BuildSnapshotRecursive(const AgentElement& node, const std::string& parentId, const std::string& parentPath, UiSnapshot& out) {
    std::string nodeKey = BuildNodeKey(node);
    std::string path = parentPath.empty() ? nodeKey : parentPath + "/" + nodeKey;
    std::string id = Hash64Hex(path);

    NodeSnapshot snap;
    snap.id = id;
    snap.name = node.name;
    snap.controlType = node.controlType;
    snap.automationId = node.automationId;
    snap.value = node.value;
    snap.labeledBy = node.labeledBy;
    snap.x = node.x;
    snap.y = node.y;
    snap.w = node.w;
    snap.h = node.h;
    snap.patterns = node.patterns;
    snap.parentId = parentId;

    snap.childrenIds.reserve(node.children.size());
    for (const auto& child : node.children) {
        std::string childId = BuildSnapshotRecursive(child, id, path, out);
        snap.childrenIds.push_back(childId);
    }

    out.nodes[id] = snap;
    return id;
}

UiSnapshot BuildSnapshotFromTree(const AgentElement& root) {
    UiSnapshot snap;
    snap.rootId = BuildSnapshotRecursive(root, "", "", snap);
    return snap;
}

UiSnapshot BuildPlaceholderSnapshot(const std::string& name) {
    AgentElement root;
    root.name = name;
    root.controlType = "Pane";
    root.automationId = "";
    root.value = "";
    root.labeledBy = "";
    root.x = 0; root.y = 0; root.w = 0; root.h = 0;
    return BuildSnapshotFromTree(root);
}

json SnapshotNodeToJson(const NodeSnapshot& node, bool includeValue, bool includeBounds, bool includePatterns, bool includeParent) {
    json j;
    j["id"] = node.id;
    if (!node.name.empty()) j["name"] = node.name;
    if (!node.controlType.empty()) j["controlType"] = node.controlType;
    if (!node.automationId.empty()) j["automationId"] = node.automationId;
    if (!node.labeledBy.empty()) j["labeledBy"] = node.labeledBy;
    if (includeValue && !node.value.empty()) j["value"] = ClipString(node.value, 80);
    if (includeBounds) j["bounds"] = { {"x", node.x}, {"y", node.y}, {"w", node.w}, {"h", node.h} };
    if (includePatterns && !node.patterns.empty()) j["patterns"] = node.patterns;
    if (includeParent && !node.parentId.empty()) j["parent"] = node.parentId;
    return j;
}

void SnapshotToJsonRecursive(const UiSnapshot& snap, const std::string& id, json& out) {
    auto it = snap.nodes.find(id);
    if (it == snap.nodes.end()) return;
    const NodeSnapshot& node = it->second;

    bool includeValue = !node.value.empty() && node.value.size() <= 120;
    bool includeBounds = true;
    bool includePatterns = !node.patterns.empty();
    out = SnapshotNodeToJson(node, includeValue, includeBounds, includePatterns, false);

    if (!node.childrenIds.empty()) {
        out["children"] = json::array();
        for (const auto& childId : node.childrenIds) {
            json c;
            SnapshotToJsonRecursive(snap, childId, c);
            out["children"].push_back(c);
        }
    }
}

std::string SnapshotToJsonString(const UiSnapshot& snap) {
    if (snap.rootId.empty()) return "{}";
    json root;
    SnapshotToJsonRecursive(snap, snap.rootId, root);
    return root.dump();
}

std::vector<std::string> GetAncestorChain(const UiSnapshot& snap, const std::string& id, size_t maxDepth = 8) {
    std::vector<std::string> chain;
    auto it = snap.nodes.find(id);
    if (it == snap.nodes.end()) return chain;
    std::string cur = it->second.parentId;
    while (!cur.empty() && chain.size() < maxDepth) {
        chain.push_back(cur);
        auto it2 = snap.nodes.find(cur);
        if (it2 == snap.nodes.end()) break;
        cur = it2->second.parentId;
    }
    return chain;
}

UiDiffResult BuildUiDiff(const UiSnapshot& prev, const UiSnapshot& cur) {
    UiDiffResult res;
    res.diffJson = json::object();
    res.diffJson["added"] = json::array();
    res.diffJson["removed"] = json::array();
    res.diffJson["updated"] = json::array();
    res.diffJson["ancestor_chains"] = json::array();

    for (const auto& kv : cur.nodes) {
        const std::string& id = kv.first;
        const NodeSnapshot& node = kv.second;
        auto itPrev = prev.nodes.find(id);
        if (itPrev == prev.nodes.end()) {
            bool includeValue = node.controlType == "Edit" || node.controlType == "Document";
            bool includeBounds = IsActionableControlType(node.controlType) || HasActionablePattern(node);
            bool includePatterns = !node.patterns.empty();
            res.diffJson["added"].push_back(SnapshotNodeToJson(node, includeValue, includeBounds, includePatterns, true));
            res.changedIds.insert(id);
            continue;
        }

        const NodeSnapshot& prevNode = itPrev->second;
        json changes;
        if (node.name != prevNode.name) changes["name"] = node.name;
        if (node.controlType != prevNode.controlType) changes["controlType"] = node.controlType;
        if (node.automationId != prevNode.automationId) changes["automationId"] = node.automationId;
        if (node.labeledBy != prevNode.labeledBy) changes["labeledBy"] = node.labeledBy;
        if (node.value != prevNode.value && !node.value.empty()) changes["value"] = ClipString(node.value, 80);
        if (node.parentId != prevNode.parentId && !node.parentId.empty()) changes["parent"] = node.parentId;
        if (node.x != prevNode.x || node.y != prevNode.y || node.w != prevNode.w || node.h != prevNode.h) {
            if (IsActionableControlType(node.controlType) || HasActionablePattern(node)) {
                changes["bounds"] = { {"x", node.x}, {"y", node.y}, {"w", node.w}, {"h", node.h} };
            }
        }
        if (node.patterns != prevNode.patterns && !node.patterns.empty()) changes["patterns"] = node.patterns;

        if (!changes.empty()) {
            json upd;
            upd["id"] = id;
            upd["changes"] = changes;
            res.diffJson["updated"].push_back(upd);
            res.changedIds.insert(id);
        }
    }

    for (const auto& kv : prev.nodes) {
        const std::string& id = kv.first;
        if (cur.nodes.find(id) == cur.nodes.end()) {
            json rem;
            rem["id"] = id;
            if (!kv.second.parentId.empty()) rem["parent"] = kv.second.parentId;
            res.diffJson["removed"].push_back(rem);
        }
    }

    for (const auto& id : res.changedIds) {
        auto chain = GetAncestorChain(cur, id);
        if (!chain.empty()) {
            json entry;
            entry["id"] = id;
            entry["ancestors"] = chain;
            res.diffJson["ancestor_chains"].push_back(entry);
        }
    }

    for (const auto& kv : prev.nodes) {
        const std::string& id = kv.first;
        if (cur.nodes.find(id) != cur.nodes.end()) continue;
        auto chain = GetAncestorChain(prev, id);
        if (!chain.empty()) {
            json entry;
            entry["id"] = id;
            entry["ancestors"] = chain;
            res.diffJson["ancestor_chains"].push_back(entry);
        }
    }

    res.changedCount = res.diffJson["added"].size() + res.diffJson["removed"].size() + res.diffJson["updated"].size();
    return res;
}

float ScoreNode(const NodeSnapshot& node, const std::unordered_set<std::string>& changedIds, const std::vector<std::string>& keywords) {
    float score = 0.0f;
    if (HasActionablePattern(node)) score += 1.5f;
    if (IsActionableControlType(node.controlType)) score += 1.0f;
    if (node.controlType == "Edit") score += 0.5f;
    if (changedIds.find(node.id) != changedIds.end()) score += 2.0f;
    if (!node.automationId.empty()) score += 0.2f;
    if (node.w > 0 && node.h > 0) score += 0.2f;
    if (node.controlType == "Window") score += 0.3f;

    if (!keywords.empty()) {
        std::string text = node.name + " " + node.labeledBy + " " + node.value + " " + node.automationId;
        for (const auto& k : keywords) {
            if (ContainsCaseInsensitive(text, k)) score += 0.8f;
        }
    }

    if (score > 6.0f) score = 6.0f;
    return score;
}

void AddAncestors(const UiSnapshot& snap, const std::string& id, std::unordered_set<std::string>& includeIds, size_t maxDepth = 6) {
    auto chain = GetAncestorChain(snap, id, maxDepth);
    for (const auto& a : chain) includeIds.insert(a);
}

void AddSiblings(const UiSnapshot& snap, const std::string& id, std::unordered_set<std::string>& includeIds, size_t maxSiblings = 6) {
    auto it = snap.nodes.find(id);
    if (it == snap.nodes.end()) return;
    const std::string& parentId = it->second.parentId;
    if (parentId.empty()) return;
    auto pIt = snap.nodes.find(parentId);
    if (pIt == snap.nodes.end()) return;
    const auto& children = pIt->second.childrenIds;
    size_t count = 0;
    for (const auto& cid : children) {
        if (count >= maxSiblings) break;
        includeIds.insert(cid);
        count++;
    }
}

ContextBuildResult BuildContextPayload(const UiSnapshot& snap, const std::unordered_set<std::string>& changedIds, const std::vector<std::string>& keywords) {
    ContextBuildResult res;
    res.contextJson = json::array();
    if (snap.nodes.empty()) return res;

    std::vector<std::pair<std::string, float>> scored;
    scored.reserve(snap.nodes.size());
    for (const auto& kv : snap.nodes) {
        float score = ScoreNode(kv.second, changedIds, keywords);
        res.scores[kv.first] = score;
        scored.push_back({ kv.first, score });
    }

    std::sort(scored.begin(), scored.end(), [](const auto& a, const auto& b) {
        if (a.second != b.second) return a.second > b.second;
        return a.first < b.first;
    });

    res.includeIds.insert(snap.rootId);
    for (const auto& id : changedIds) {
        if (snap.nodes.find(id) != snap.nodes.end()) res.includeIds.insert(id);
    }

    const size_t kMax = 60;
    for (size_t i = 0; i < scored.size() && i < kMax; i++) {
        res.includeIds.insert(scored[i].first);
    }

    std::vector<std::string> seedIds(res.includeIds.begin(), res.includeIds.end());
    for (const auto& id : seedIds) {
        AddAncestors(snap, id, res.includeIds);
        AddSiblings(snap, id, res.includeIds);
    }

    std::vector<std::string> orderedIds(res.includeIds.begin(), res.includeIds.end());
    std::sort(orderedIds.begin(), orderedIds.end(), [&](const std::string& a, const std::string& b) {
        float sa = res.scores.count(a) ? res.scores[a] : 0.0f;
        float sb = res.scores.count(b) ? res.scores[b] : 0.0f;
        if (sa != sb) return sa > sb;
        return a < b;
    });

    for (const auto& id : orderedIds) {
        auto it = snap.nodes.find(id);
        if (it == snap.nodes.end()) continue;
        const NodeSnapshot& node = it->second;

        bool includeValue = (node.controlType == "Edit" || node.controlType == "Document") && !node.value.empty();
        bool includeBounds = (IsActionableControlType(node.controlType) || HasActionablePattern(node)) && node.name.empty() && node.automationId.empty();
        bool includePatterns = HasActionablePattern(node);
        json j = SnapshotNodeToJson(node, includeValue, includeBounds, includePatterns, true);
        if (changedIds.find(id) != changedIds.end()) j["changed"] = true;
        res.contextJson.push_back(j);
    }

    return res;
}

std::unordered_map<std::string, std::vector<std::string>> BuildAdjacency(const UiSnapshot& snap) {
    std::unordered_map<std::string, std::vector<std::string>> adj;
    for (const auto& kv : snap.nodes) {
        const NodeSnapshot& node = kv.second;
        for (const auto& childId : node.childrenIds) {
            adj[node.id].push_back(childId);
            adj[childId].push_back(node.id);
        }
        for (size_t i = 1; i < node.childrenIds.size(); i++) {
            const std::string& a = node.childrenIds[i - 1];
            const std::string& b = node.childrenIds[i];
            adj[a].push_back(b);
            adj[b].push_back(a);
        }
    }

    for (auto& kv : adj) {
        auto& vec = kv.second;
        std::sort(vec.begin(), vec.end());
        vec.erase(std::unique(vec.begin(), vec.end()), vec.end());
    }
    return adj;
}

std::string BuildAdjacencyJson(const UiSnapshot& snap, const std::unordered_set<std::string>& includeIds) {
    json arr = json::array();
    if (snap.nodes.empty() || includeIds.empty()) return arr.dump();

    auto adj = BuildAdjacency(snap);
    std::vector<std::string> orderedIds(includeIds.begin(), includeIds.end());
    std::sort(orderedIds.begin(), orderedIds.end());

    for (const auto& id : orderedIds) {
        json entry;
        entry["id"] = id;
        auto it = adj.find(id);
        if (it != adj.end()) {
            json neighbors = json::array();
            for (const auto& n : it->second) {
                if (includeIds.find(n) != includeIds.end()) neighbors.push_back(n);
            }
            entry["neighbors"] = neighbors;
        }
        arr.push_back(entry);
    }
    return arr.dump();
}

void BuildAgentTree(IUIAutomation* pAutomation, IUIAutomationElement* pElement, AgentElement& node, int depth = 0) {
    if (!pElement) return;
    g_agentTreeElementCount++;

    BSTR bName = NULL, bId = NULL, bValue = NULL;
    CONTROLTYPEID cType = 0;
    pElement->get_CurrentName(&bName);
    pElement->get_CurrentControlType(&cType);
    pElement->get_CurrentAutomationId(&bId);

    node.name = BstrToStdString(bName);
    node.automationId = BstrToStdString(bId);
    node.controlType = ControlTypeIdToString(cType);

    RECT r;
    pElement->get_CurrentBoundingRectangle(&r);
    node.x = r.left; node.y = r.top; node.w = r.right - r.left; node.h = r.bottom - r.top;

    IUnknown* pPattern = NULL;
    if (SUCCEEDED(pElement->GetCurrentPattern(UIA_InvokePatternId, &pPattern)) && pPattern) {
        node.patterns.push_back("Invoke"); pPattern->Release();
    }
    if (SUCCEEDED(pElement->GetCurrentPattern(UIA_ValuePatternId, &pPattern)) && pPattern) {
        node.patterns.push_back("Value");
        IUIAutomationValuePattern* pVal = NULL;
        pElement->QueryInterface(__uuidof(IUIAutomationValuePattern), (void**)&pVal);
        if (pVal) {
            pVal->get_CurrentValue(&bValue);
            node.value = BstrToStdString(bValue);
            pVal->Release();
            SysFreeString(bValue);
        }
        pPattern->Release();
    }
    if (SUCCEEDED(pElement->GetCurrentPattern(UIA_TogglePatternId, &pPattern)) && pPattern) {
        node.patterns.push_back("Toggle"); pPattern->Release();
    }
    if (SUCCEEDED(pElement->GetCurrentPattern(UIA_SelectionItemPatternId, &pPattern)) && pPattern) {
        node.patterns.push_back("SelectionItem"); pPattern->Release();
    }
    if (SUCCEEDED(pElement->GetCurrentPattern(UIA_ExpandCollapsePatternId, &pPattern)) && pPattern) {
        node.patterns.push_back("ExpandCollapse"); pPattern->Release();
    }
    if (SUCCEEDED(pElement->GetCurrentPattern(UIA_ScrollPatternId, &pPattern)) && pPattern) {
        node.patterns.push_back("Scroll"); pPattern->Release();
    }

    IUIAutomationElement* pLabel = NULL;
    if (SUCCEEDED(pElement->get_CurrentLabeledBy(&pLabel)) && pLabel) {
        BSTR bLabelName;
        if (SUCCEEDED(pLabel->get_CurrentName(&bLabelName))) {
            node.labeledBy = BstrToStdString(bLabelName);
            SysFreeString(bLabelName);
        }
        pLabel->Release();
    }

    SysFreeString(bName);
    SysFreeString(bId);

    IUIAutomationTreeWalker* pWalker = NULL;
    pAutomation->get_ControlViewWalker(&pWalker);
    if (pWalker) {
        IUIAutomationElement* pChild = NULL;
        pWalker->GetFirstChildElement(pElement, &pChild);
        while (pChild) {
            AgentElement childNode;
            BuildAgentTree(pAutomation, pChild, childNode, depth + 1);
            node.children.push_back(childNode);

            IUIAutomationElement* pNext = NULL;
            pWalker->GetNextSiblingElement(pChild, &pNext);
            pChild->Release();
            pChild = pNext;
        }
        pWalker->Release();
    }
}

void SerializeAgentTree(const AgentElement& node, json& j) {
    j["name"] = node.name;
    j["controlType"] = node.controlType;
    if (!node.automationId.empty()) j["automationId"] = node.automationId;
    if (!node.value.empty()) j["value"] = node.value;
    if (!node.labeledBy.empty()) j["labeledBy"] = node.labeledBy;
    j["bounds"] = { {"x", node.x}, {"y", node.y}, {"w", node.w}, {"h", node.h} };
    if (!node.patterns.empty()) j["patterns"] = node.patterns;

    if (!node.children.empty()) {
        j["children"] = json::array();
        for (const auto& child : node.children) {
            json c;
            SerializeAgentTree(child, c);
            j["children"].push_back(c);
        }
    }
}

struct PidWindowEnum {
    DWORD pid;
    std::vector<HWND> windows;
};

BOOL CALLBACK EnumWindowsForPidProc(HWND hwnd, LPARAM lParam) {
    PidWindowEnum* data = (PidWindowEnum*)lParam;
    DWORD pid = 0;
    GetWindowThreadProcessId(hwnd, &pid);
    if (pid == data->pid && IsWindowVisible(hwnd) && GetWindowTextLength(hwnd) > 0) {
        data->windows.push_back(hwnd);
    }
    return TRUE;
}

UiSnapshot GetUiTreeSnapshot(HWND hwnd) {
    CoInitializeEx(NULL, COINIT_MULTITHREADED);
    IUIAutomation* pAutomation = NULL;
    CoCreateInstance(__uuidof(CUIAutomation), NULL, CLSCTX_INPROC_SERVER, __uuidof(IUIAutomation), (void**)&pAutomation);

    if (!pAutomation) {
        CoUninitialize();
        return BuildPlaceholderSnapshot("No UI Automation");
    }

    DWORD targetPid = 0;
    GetWindowThreadProcessId(hwnd, &targetPid);

    PidWindowEnum enumData;
    enumData.pid = targetPid;
    EnumWindows(EnumWindowsForPidProc, (LPARAM)&enumData);

    if (enumData.windows.empty()) {
        enumData.windows.push_back(hwnd);
    }

    AgentElement processRoot;
    processRoot.name = "ProcessRoot";
    processRoot.controlType = "Process";
    processRoot.automationId = "";
    processRoot.value = "";
    processRoot.labeledBy = "";
    processRoot.x = 0; processRoot.y = 0; processRoot.w = 0; processRoot.h = 0;
    g_agentTreeElementCount = 0;

    for (HWND wnd : enumData.windows) {
        IUIAutomationElement* pTarget = NULL;
        pAutomation->ElementFromHandle(wnd, &pTarget);
        if (pTarget) {
            AgentElement windowNode;
            BuildAgentTree(pAutomation, pTarget, windowNode);
            processRoot.children.push_back(windowNode);
            pTarget->Release();
        }
    }

    pAutomation->Release();
    CoUninitialize();

    return BuildSnapshotFromTree(processRoot);
}

struct AgentAction {
    std::string action;
    std::string value;
    json locator;
};

struct AgentStepLog {
    int step;
    std::string goal;
    std::string reasoning;
    std::string error;
    json plan;
    bool success;
    float confidence = 1.0f;
};

struct PlannerResponse {
    bool valid = false;
    bool isDone = false;
    float confidence = 1.0f;
    int tokenBudget = -1;
    std::string reasoning;
    std::string nextGoal;
    std::string parseError;
    std::vector<AgentAction> actions;
};

static int SpawnSubAgentFromAgent(int parentSessionId, HWND parentTarget, const std::string& parentTargetProcess, int parentTokenBudget, const std::string& subGoal);
static bool ParsePlannerResponseStrict(const std::string& raw, PlannerResponse& out);
static bool ActionNeedsUiChange(const AgentAction& action);
static int ClampPlannerTokenBudget(int v);
static bool TryExtractJsonValue(const std::string& raw, std::string& out);

class AgentCore {
public:
    int sessionId = 0;
    int parentSessionId = -1;
    bool isSubAgent = false;
    bool lockTargetWindow = false;
    bool isRunning = false;
    std::atomic<bool> threadExited{ true };
    bool isPaused = false;
    std::string currentGoal;
    std::string currentSubGoal;
    std::string historySummary;
    std::vector<AgentStepLog> executionLog;
    std::string statusMessage = "Idle";
    int maxSteps = 1500;
    int plannerTokenBudget = 512;
    HWND targetWindow = NULL;
    std::string targetProcessName = "None";
    std::string lastActionResult;
    UiSnapshot prevSnapshot;
    bool hasPrevSnapshot = false;
    bool forceFullTreeNext = false;
    bool includeAdjacencyNext = false;
    std::string pendingAdjacency;
    int consecutiveFailures = 0;
    bool lastStepHadAction = false;
    bool lastStepSuccess = true;
    int workerIndex = 0;
    int workerCount = 0;

    void ConfigureSession(int id, int parentId, bool subAgent, HWND target, const std::string& processName, int tokenBudget) {
        sessionId = id;
        parentSessionId = parentId;
        isSubAgent = subAgent;
        lockTargetWindow = subAgent;
        targetWindow = target;
        targetProcessName = processName;
        plannerTokenBudget = ClampPlannerTokenBudget(tokenBudget);
    }

    void ConfigureWorkerSlot(int index, int total) {
        workerIndex = index;
        workerCount = total;
    }

    void Start(const std::string& goal) {
        if (isRunning) return;
        currentGoal = goal;
        currentSubGoal = "";
        if (!targetWindow) {
            targetWindow = g_targetWindow;
            targetProcessName = g_targetProcessName;
        }
        threadExited = false;
        isRunning = true;
        g_runningAgentCount.fetch_add(1);
        g_agentExecuting = true;
        isPaused = false;
        executionLog.clear();
        historySummary.clear();
        lastActionResult.clear();
        g_telegramScreenshotWarned = false;
        hasPrevSnapshot = false;
        forceFullTreeNext = false;
        includeAdjacencyNext = false;
        pendingAdjacency.clear();
        consecutiveFailures = 0;
        lastStepHadAction = false;
        lastStepSuccess = true;

        std::thread([this]() {
            RunLoop();
        }).detach();
    }

    void Stop() {
        isRunning = false;
        statusMessage = "Stopped by user.";
    }

    void Pause() { isPaused = true; statusMessage = "Paused by user."; }
    void Resume() { isPaused = false; statusMessage = "Resumed."; }

private:
    void RunLoop() {
        Sleep(1000);
        std::vector<json> actionHistory;
        std::string executionError = "";

        for (int step = 1; step <= maxSteps && isRunning; step++) {
            {
                std::lock_guard<std::mutex> lock(g_agentMutex);
                statusMessage = "Step " + std::to_string(step) + ": Analysing...";
            }

            if (g_telegramEnabled && g_telegramPolling && step == 1) {
                SendStepScreenshot("[STEP 0] Initial state");
            }

            if (g_telegramEnabled && g_telegramPolling) {
                TelegramBridge::SendMessage("[Step " + std::to_string(step) + "] Analysing UI...");
            }

            if (!IsInputDesktopActive()) {
                {
                    std::lock_guard<std::mutex> lock(g_agentMutex);
                    statusMessage = "Desktop Inactive (Paused)...";
                }
                Sleep(500);
                step--;
                continue;
            }

            if (targetWindow && !IsWindow(targetWindow)) {
                DWORD savedPid = 0;
                GetWindowThreadProcessId(targetWindow, &savedPid);
                HWND recovered = NULL;
                if (savedPid != 0) {
                    PidWindowEnum recovery;
                    recovery.pid = savedPid;
                    EnumWindows(EnumWindowsForPidProc, (LPARAM)&recovery);
                    if (!recovery.windows.empty()) recovered = recovery.windows[0];
                }
                if (recovered) {
                    targetWindow = recovered;
                    std::lock_guard<std::mutex> lock(g_agentMutex);
                    statusMessage = "Window recovered. Continuing...";
                }
                else {
                    targetWindow = NULL;
                    std::lock_guard<std::mutex> lock(g_agentMutex);
                    statusMessage = "Target window lost. Requesting new target...";
                }
            }

            if (!isSubAgent && targetWindow && IsWindow(targetWindow)) {
                if (IsIconic(targetWindow)) ShowWindow(targetWindow, SW_RESTORE);
                SetForegroundWindow(targetWindow);
                Sleep(500);
            }

            UiSnapshot uiSnapshot;
            if (targetWindow && IsWindow(targetWindow)) {
                for (int scanPass = 0; scanPass < 3; scanPass++) {
                    {
                        std::lock_guard<std::mutex> lock(g_agentMutex);
                        statusMessage = "Step " + std::to_string(step) + ": Analysing (" + std::to_string(scanPass + 1) + "/3)...";
                    }
                    Sleep(1000);
                    uiSnapshot = GetUiTreeSnapshot(targetWindow);
                }
            }
            else {
                uiSnapshot = BuildPlaceholderSnapshot("No Process Attached");
            }

            while (isPaused && isRunning) {
                Sleep(100);
            }
            if (!isRunning) break;

            {
                std::lock_guard<std::mutex> lock(g_agentMutex);
                statusMessage = "Step " + std::to_string(step) + ": Planning...";
            }
            UiDiffResult diff;
            if (hasPrevSnapshot) {
                diff = BuildUiDiff(prevSnapshot, uiSnapshot);
            }
            else {
                diff.diffJson = json::object();
                diff.diffJson["added"] = json::array();
                diff.diffJson["removed"] = json::array();
                diff.diffJson["updated"] = json::array();
                diff.diffJson["ancestor_chains"] = json::array();
                diff.changedCount = 0;
            }

            bool useFullTree = !hasPrevSnapshot || forceFullTreeNext;
            if (forceFullTreeNext) forceFullTreeNext = false;

            if (hasPrevSnapshot && !uiSnapshot.nodes.empty()) {
                float diffRatio = (float)diff.changedCount / (float)uiSnapshot.nodes.size();
                if (diffRatio > 0.2f) useFullTree = true;
            }
            if (hasPrevSnapshot && lastStepHadAction && diff.changedCount == 0) useFullTree = true;
            if (consecutiveFailures >= 2) useFullTree = true;

            std::string keywordBase = currentGoal + " " + currentSubGoal + " " + executionError;
            auto keywords = ExtractKeywords(keywordBase);
            auto context = BuildContextPayload(uiSnapshot, diff.changedIds, keywords);
            std::string latestAdjacency = BuildAdjacencyJson(uiSnapshot, context.includeIds);

            UiPromptPayload payload;
            payload.diff = hasPrevSnapshot ? diff.diffJson.dump() : "";
            payload.context = context.contextJson.dump();
            payload.fullTree = useFullTree ? SnapshotToJsonString(uiSnapshot) : "";
            payload.usedFullTree = useFullTree;
            payload.includeAdjacency = includeAdjacencyNext;
            payload.adjacency = includeAdjacencyNext ? pendingAdjacency : "";
            if (includeAdjacencyNext) {
                includeAdjacencyNext = false;
                pendingAdjacency.clear();
            }

            std::string prompt = BuildPrompt(payload, actionHistory, executionError);
            std::string planJsonStr = CallPlannerApi(prompt, plannerTokenBudget);

            AgentStepLog logEntry;
            logEntry.step = step;
            logEntry.goal = currentSubGoal.empty() ? currentGoal : currentSubGoal;

            try {
                logEntry.plan = json::parse(planJsonStr);
            }
            catch (...) {
                logEntry.plan = planJsonStr;
            }

            PlannerResponse planner;
            ParsePlannerResponseStrict(planJsonStr, planner);
            bool goalDone = planner.isDone;
            std::string plannerReasoning = planner.reasoning;
            float plannerConfidence = planner.confidence;
            std::vector<AgentAction> actions = planner.actions;

            if (!planner.nextGoal.empty()) {
                currentSubGoal = planner.nextGoal;
            }
            if (planner.tokenBudget > 0) {
                plannerTokenBudget = ClampPlannerTokenBudget(planner.tokenBudget);
            }

            logEntry.reasoning = plannerReasoning;
            logEntry.confidence = plannerConfidence;

            if (!planner.valid) {
                std::string errMsg = planner.parseError.empty() ? "Planner parse failed" : planner.parseError;
                std::lock_guard<std::mutex> lock(g_agentMutex);
                statusMessage = "Planner response invalid: " + ClipString(errMsg, 180);
                logEntry.success = false;
                logEntry.error = errMsg;
                executionLog.push_back(logEntry);
                executionError = logEntry.error;
                consecutiveFailures++;
                includeAdjacencyNext = true;
                pendingAdjacency = latestAdjacency;
                forceFullTreeNext = true;
                prevSnapshot = uiSnapshot;
                hasPrevSnapshot = true;
                if (consecutiveFailures >= 4) {
                    isRunning = false;
                }
                continue;
            }

            if (plannerConfidence < 0.6f) {
                forceFullTreeNext = true;
            }

            bool requestAdjacency = false;
            bool requestFullTree = false;
            bool spawnedSubAgent = false;
            std::vector<AgentAction> execActions;
            execActions.reserve(actions.size());
            for (const auto& action : actions) {
                if (action.action == "request_adjacency") {
                    requestAdjacency = true;
                    continue;
                }
                if (action.action == "request_full_tree") {
                    requestFullTree = true;
                    continue;
                }
                if (action.action == "spawn_subagent") {
                    std::string subGoal = action.value;
                    if (!subGoal.empty()) {
                        int childId = SpawnSubAgentFromAgent(sessionId, targetWindow, targetProcessName, plannerTokenBudget, subGoal);
                        if (childId > 0) {
                            spawnedSubAgent = true;
                            json acc;
                            acc["action"] = "spawn_subagent";
                            acc["value"] = subGoal;
                            acc["child_id"] = childId;
                            actionHistory.push_back(acc);
                        }
                    }
                    continue;
                }
                execActions.push_back(action);
            }

            if (requestAdjacency) {
                includeAdjacencyNext = true;
                pendingAdjacency = latestAdjacency;
            }
            if (requestFullTree) {
                forceFullTreeNext = true;
            }

            if (requestAdjacency || requestFullTree || spawnedSubAgent) {
                {
                    std::lock_guard<std::mutex> lock(g_agentMutex);
                    if (requestFullTree) statusMessage = "Context requested: Full tree";
                    else if (requestAdjacency) statusMessage = "Context requested: Adjacency";
                    else statusMessage = "Spawned sub-agent task.";
                    logEntry.success = true;
                    logEntry.error = requestFullTree ? "Context request: full tree" : (requestAdjacency ? "Context request: adjacency" : "Sub-agent spawned");
                    executionLog.push_back(logEntry);
                }
                lastStepHadAction = false;
                lastStepSuccess = true;
                prevSnapshot = uiSnapshot;
                hasPrevSnapshot = true;
                continue;
            }

            actions = execActions;

            if (g_telegramEnabled && g_telegramPolling && !plannerReasoning.empty()) {
                TelegramBridge::SendMessage("[PLANNER] " + plannerReasoning);
            }

            if (goalDone) {
                std::lock_guard<std::mutex> lock(g_agentMutex);
                statusMessage = "Goal Achieved!";
                logEntry.success = true;
                logEntry.error = "Goal completed. Reasoning: " + plannerReasoning;
                executionLog.push_back(logEntry);
                if (g_telegramEnabled && g_telegramPolling) {
                    SendStepScreenshot("[DONE] Final state");
                }
                isRunning = false;
                if (g_telegramEnabled && g_telegramPolling) {
                    TelegramBridge::SendMessage("[DONE] Goal Achieved! " + plannerReasoning);
                }
                break;
            }

            if (actions.empty()) {
                {
                    std::lock_guard<std::mutex> lock(g_agentMutex);
                    statusMessage = "Planner returned no actions. Retrying...";
                    logEntry.success = false;
                    logEntry.error = "No actions returned. Reasoning: " + plannerReasoning;
                    executionLog.push_back(logEntry);
                }
                executionError = logEntry.error;
                lastStepHadAction = false;
                lastStepSuccess = false;
                consecutiveFailures++;
                includeAdjacencyNext = true;
                pendingAdjacency = latestAdjacency;
                forceFullTreeNext = true;
                prevSnapshot = uiSnapshot;
                hasPrevSnapshot = true;
                if (consecutiveFailures >= 4) {
                    isRunning = false;
                    break;
                }
                continue;
            }

            {
                std::lock_guard<std::mutex> lock(g_agentMutex);
                statusMessage = "Step " + std::to_string(step) + ": Executing " + actions[0].action + "...";
            }
            bool success = true;
            bool needsVisualVerify = false;
            for (const auto& action : actions) {
                if (ActionNeedsUiChange(action)) {
                    needsVisualVerify = true;
                }
                if (g_telegramEnabled && g_telegramPolling) {
                    std::string actionMsg = "[EXEC] " + action.action;
                    if (!action.value.empty()) actionMsg += " '" + action.value + "'";
                    TelegramBridge::SendMessage(actionMsg);
                }
                if (!ExecuteAction(action)) {
                    success = false;
                    executionError = "Action failed: " + action.action + (action.locator.is_object() && !action.locator.empty() ? " on " + action.locator.dump() : "");
                    if (g_telegramEnabled && g_telegramPolling) {
                        TelegramBridge::SendMessage("[FAILED] " + action.action);
                    }
                    break;
                }
                Sleep(1500);
            }

            if (success && needsVisualVerify && targetWindow && IsWindow(targetWindow)) {
                UiSnapshot verifySnapshot = GetUiTreeSnapshot(targetWindow);
                UiDiffResult verifyDiff = BuildUiDiff(uiSnapshot, verifySnapshot);
                if (verifyDiff.changedCount == 0) {
                    success = false;
                    executionError = "Verifier: no observable UI change after action.";
                }
            }

            if (g_telegramEnabled && g_telegramPolling) {
                SendStepScreenshot("[STEP " + std::to_string(step) + "] Result");
            }

            logEntry.success = success;
            if (success) {
                executionError = "";
                for (const auto& action : actions) {
                    json acc;
                    acc["action"] = action.action;
                    acc["locator"] = action.locator;
                    acc["value"] = action.value;
                    if (!plannerReasoning.empty()) acc["reasoning"] = plannerReasoning;
                    actionHistory.push_back(acc);
                }
                if (actionHistory.size() > 40) {
                    size_t keepFrom = actionHistory.size() - 20;
                    std::ostringstream ss;
                    for (size_t i = 0; i < keepFrom; i++) {
                        std::string act = actionHistory[i].value("action", "?");
                        std::string val = actionHistory[i].value("value", "");
                        ss << act;
                        if (!val.empty()) ss << "(\"" << ClipString(val, 24) << "\")";
                        if (i + 1 < keepFrom) ss << ", ";
                    }
                    std::string compact = ss.str();
                    if (!compact.empty()) {
                        if (!historySummary.empty()) historySummary += " | ";
                        historySummary += compact;
                        historySummary = ClipString(historySummary, 1200);
                    }
                    actionHistory.erase(actionHistory.begin(), actionHistory.begin() + keepFrom);
                }
            }
            else {
                logEntry.error = executionError;
            }

            {
                std::lock_guard<std::mutex> lock(g_agentMutex);
                executionLog.push_back(logEntry);
            }

            lastStepHadAction = true;
            lastStepSuccess = success;
            if (success) consecutiveFailures = 0;
            else consecutiveFailures++;
            prevSnapshot = uiSnapshot;
            hasPrevSnapshot = true;
        }

        {
            std::lock_guard<std::mutex> lock(g_agentMutex);
            if (isRunning) statusMessage = "Finished.";
            isRunning = false;
        }
        int runningLeft = g_runningAgentCount.fetch_sub(1) - 1;
        if (runningLeft <= 0) {
            g_agentExecuting = false;
        }
        threadExited = true;
    }

    std::string BuildPrompt(const UiPromptPayload& payload, const std::vector<json>& history, const std::string& error) {
        std::stringstream ss;
        ss << "ORIGINAL USER GOAL: " << currentGoal << "\n\n";

        if (!currentSubGoal.empty() && currentSubGoal != currentGoal) {
            ss << "REMAINING GOAL (focus on this, the above steps are done): " << currentSubGoal << "\n\n";
        }

        if (!lastActionResult.empty()) {
            ss << "LAST ACTION RESULT:\n" << lastActionResult << "\n\n";
            lastActionResult = "";
        }

        if (targetWindow && IsWindow(targetWindow)) {
            char tBuf[256] = {};
            GetWindowTextA(targetWindow, tBuf, sizeof(tBuf));
            ss << "CURRENTLY ATTACHED TO: \"" << tBuf << "\"\n\n";
        }
        else {
            ss << "NO PROCESS ATTACHED.\n\n";
        }

        if (!historySummary.empty()) {
            ss << "COMPLETED ACTION SUMMARY:\n" << historySummary << "\n\n";
        }

        if (!history.empty()) {
            ss << "COMPLETED ACTIONS (these are ALREADY DONE - DO NOT repeat them):\n";
            for (size_t i = 0; i < history.size(); i++) {
                ss << "  Step " << (i + 1) << ": ";
                std::string act = history[i].value("action", "?");
                std::string val = history[i].value("value", "");
                std::string reasoning = history[i].value("reasoning", "");
                ss << act;
                if (!val.empty()) ss << " \"" << val << "\"";
                if (history[i].contains("locator")) ss << " on " << history[i]["locator"].dump();
                if (!reasoning.empty()) ss << " (" << reasoning << ")";
                ss << " [DONE]\n";
            }
            ss << "\n";
        }

        if (!error.empty()) {
            ss << "LAST ERROR (you must work around this): " << error << "\n\n";
        }

        if (!error.empty()) {
            ss << "ERROR RECOVERY RULES: Read the error and adapt. If fixing/replacing code, select all, delete, then type new content.\n\n";
        }

        if (GoalImpliesEditing(currentGoal + " " + currentSubGoal)) {
            ss << "TEXT EDITING RULE: Do one step at a time (Ctrl+A, then Backspace, then Type).\n\n";
        }

        if (isSubAgent) {
            ss << "WORKER MODE: You are worker " << workerIndex << " of " << workerCount << ".\n";
            ss << "You are pinned to this assigned window. Do NOT switch_window, attach_process, or open_app.\n";
            ss << "Complete only your assigned sub-task independently.\n\n";
        }

        ss << "UI_CHANGES (diff from last step):\n" << (payload.diff.empty() ? "(none)" : payload.diff) << "\n\n";
        ss << "UI_CONTEXT (top relevant nodes):\n" << (payload.context.empty() ? "[]" : payload.context) << "\n\n";
        if (payload.includeAdjacency) {
            ss << "UI_ADJACENCY (top nodes + neighbors):\n" << (payload.adjacency.empty() ? "[]" : payload.adjacency) << "\n\n";
        }
        if (payload.usedFullTree && !payload.fullTree.empty()) {
            ss << "FULL_UI_TREE:\n" << payload.fullTree << "\n\n";
        }
        else {
            ss << "FULL_UI_TREE: (omitted; request_full_tree if needed)\n\n";
        }

        ss << "CURRENT PLANNER TOKEN BUDGET: " << plannerTokenBudget << " (you may adjust via token_budget in response).\n";
        ss << "Respond with a JSON object: {\"reasoning\": \"why you chose this action\", \"confidence\": 0.9, \"token_budget\": 512, \"next_goal\": \"what remains to be done after this step\", \"is_done\": false, \"actions\": [{\"action\":\"click\",\"locator\":{\"name\":\"...\"}}, ...]}\n";
        ss << "If the goal is fully completed based on the current UI, respond: {\"reasoning\": \"...\", \"confidence\": 1.0, \"token_budget\": 256, \"next_goal\": \"\", \"is_done\": true, \"actions\": []}\n";
        ss << "If you are not sure, DO NOT return empty actions. Return one safe action like request_adjacency or request_full_tree.\n";
        ss << "If you need more context, use actions: [{\"action\": \"request_adjacency\"}] or [{\"action\": \"request_full_tree\"}]. Use spawn_subagent with value when parallel subtasks help.";
        return ss.str();
    }

    std::string CallPlannerApi(const std::string& prompt, int plannerBudget) {
        if (g_providers.empty() || g_currProviderIdx >= (int)g_providers.size()) return "[]";
        auto& prov = g_providers[g_currProviderIdx];

        std::string apiKey = "";
        std::string modelID = "gemini-2.0-flash-exp";

        if (!prov.models.empty()) {
            if (g_currModelIdx >= (int)prov.models.size()) g_currModelIdx = 0;
            modelID = prov.models[g_currModelIdx].id;
        }

        if (prov.type == AIProvider::Gemini) apiKey = g_apiKeys.gemini;
        else if (prov.type == AIProvider::OpenAI) apiKey = g_apiKeys.openai;
        else if (prov.type == AIProvider::OpenAIUser) apiKey = g_apiKeys.openai;
        else if (prov.type == AIProvider::Anthropic) apiKey = g_apiKeys.claude;
        else if (prov.type == AIProvider::Moonshot) apiKey = g_apiKeys.kimi;
        else if (prov.type == AIProvider::OpenRouter) apiKey = g_apiKeys.openrouter;
        else if (prov.type == AIProvider::DeepSeek) apiKey = g_apiKeys.deepseek;

        bool useOauth = false;
        OAuthState auth;
        if (prov.type == AIProvider::OpenAIUser) {
            LockOauth();
            useOauth = g_oauthUse;
            UnlockOauth();
            if (useOauth) auth = GetOAuthCopy();
        }

        if (prov.type == AIProvider::OpenAIUser && useOauth) {
            if (!IsOAuthValid() && !Api::RefreshOAuth()) return "[]";
            auth = GetOAuthCopy();
        }

        if (prov.type != AIProvider::Ollama && !(prov.type == AIProvider::OpenAIUser && useOauth) && apiKey.empty()) return "[]";

        std::string finalResp = "[]";
        std::string rawResOrError = "";
        const int kPlannerMaxTokens = ClampPlannerTokenBudget(plannerBudget);

        std::string sysTxt =
            "You are an AI Agent controlling a Windows desktop application via UI Automation.\n\n"
            "INPUTS PROVIDED:\n"
            "- UI_CHANGES: diff from last step (may be empty)\n"
            "- UI_CONTEXT: top relevant nodes (always)\n"
            "- FULL_UI_TREE: only when explicitly provided\n"
            "- USER GOAL and COMPLETED ACTIONS\n\n"
            "CRITICAL RULES:\n"
            "1. NEVER repeat actions that are marked as [DONE] in the completed actions list.\n"
            "2. Use UI_CHANGES and UI_CONTEXT by default.\n"
            "3. If context is insufficient, request more context using request_adjacency or request_full_tree.\n"
            "4. If the goal is already achieved (based on the current UI state), set is_done to true.\n"
            "5. Include a 'confidence' score from 0.0 to 1.0 indicating how sure you are.\n\n"
            "6. NEVER return actions as empty unless is_done=true. If uncertain, request_adjacency or request_full_tree.\n\n"
            "SUPPORTED ACTIONS:\n"
            "- click: Click on a UI element. Locator: {\"name\": \"Button Text\", \"controlType\": \"Button\"}\n"
            "- right_click: Right-click to open context menu. Same locator format as click.\n"
            "- double_click: Double-click (e.g. open file, select word). Same locator format.\n"
            "- type: Type text into a field. Needs \"value\". Locator: {\"name\": \"Field\", \"controlType\": \"Edit\"}\n"
            "- press_key: Press keyboard key. \"value\": \"enter\"/\"tab\"/\"escape\"/\"backspace\"/\"ctrl+a\" etc.\n"
            "- scroll: Scroll up or down. \"value\": \"down\" or \"up\". Optionally provide a locator.\n"
            "- hover: Hover over element to reveal tooltip/dropdown. Provide locator.\n"
            "- wait_for: Wait for an element to appear. Provide locator of expected element.\n"
            "- switch_window: Switch target to another window. \"value\": partial window title.\n"
            "- clipboard: Clipboard ops. \"value\": \"copy\"/\"paste\"/\"cut\"/\"select_all\".\n"
            "- open_app: Open an application. \"value\": executable name (e.g. \"chrome.exe\", \"notepad.exe\", \"calc.exe\"). Will auto-attach to the new window.\n"
            "- attach_process: Attach to an already-open window. \"value\": window title substring, process name, or numeric index from list_processes.\n"
            "- list_processes: Get a list of all open application windows and their titles. Use this before attaching.\n"
            "- spawn_subagent: Spawn a parallel worker for an independent subtask. Put subtask text in \"value\".\n"
            "- request_adjacency: Ask for adjacency list (top nodes + neighbors).\n"
            "- request_full_tree: Ask for the full UI tree.\n\n"
            "APP USAGE RULES (CRITICAL):\n"
            "1. IF NO PROCESS IS ATTACHED (see 'NO PROCESS ATTACHED' in prompt):\n"
            "   - YOUR FIRST ACTION MUST BE 'list_processes' to see what is running.\n"
            "   - DO NOT EXECUTE 'open_app' BLINDLY unless you have already checked the list.\n"
            "2. IF YOU WANT TO SWITCH APPS:\n"
            "   - FIRST call 'list_processes'.\n"
            "   - IF the app is found, use 'attach_process'.\n"
            "   - IF NOT found, ONLY THEN use 'open_app'.\n"
            "3. 'open_app' is expensive and slow. Always prefer 'attach_process' if possible.\n"
            "4. After 'list_processes', choose the best match based on the user's intent (e.g. YouTube -> a browser window).\n\n"
            "NOTE: Screenshots may be black/unavailable. If so, ignore them and proceed using the UI tree.\n\n"
            "LOCATOR FORMAT: {\"name\": \"...\", \"controlType\": \"...\", \"automationId\": \"...\"}\n"
            "Use the most specific locator possible. Prefer automationId when available.\n"
            "Use controlType to disambiguate (Button, Edit, Document, ListItem, Hyperlink, etc).\n\n"
            "RESPONSE FORMAT (STRICT JSON, no markdown):\n"
            "{\n"
            "  \"reasoning\": \"Brief explanation of why this action is needed\",\n"
            "  \"confidence\": 0.9,\n"
            "  \"token_budget\": 512,\n"
            "  \"next_goal\": \"What remains to be done after this action\",\n"
            "  \"is_done\": false,\n"
            "  \"actions\": [{\"action\": \"click\", \"locator\": {\"name\": \"Search\"}}]\n"
            "}\n\n"
            "RETURN ONLY RAW JSON. NO MARKDOWN. NO COMMENTS. NO EXTRA TEXT.";

        if (isSubAgent) {
            sysTxt += "\nWORKER MODE: You are a pinned worker assigned to one window. Do not use switch_window, attach_process, or open_app. Execute the task only in your assigned window.";
        }

        if (prov.type == AIProvider::Gemini) {
            json reqBody;
            reqBody["system_instruction"] = { {"parts", { { {"text", sysTxt} } }} };
            reqBody["contents"] = { { {"role", "user"}, {"parts", { { {"text", prompt} } }} } };
            reqBody["generationConfig"] = { {"maxOutputTokens", kPlannerMaxTokens} };

            std::wstring path = L"/v1beta/models/" + s2ws(modelID) + L":generateContent?key=" + s2ws(apiKey);
            std::string res = AgentHttpRequest(L"generativelanguage.googleapis.com", path, "POST", reqBody.dump());
            rawResOrError = res;

            try {
                auto j = json::parse(res);
                if (j.contains("candidates") && j["candidates"].is_array() && !j["candidates"].empty()) {
                    auto& cand = j["candidates"][0];
                    if (cand.contains("content") && cand["content"].contains("parts")
                        && cand["content"]["parts"].is_array() && !cand["content"]["parts"].empty()
                        && cand["content"]["parts"][0].contains("text")) {
                        finalResp = cand["content"]["parts"][0]["text"].get<std::string>();
                    }
                }
            }
            catch (...) {}
        }
        else if (prov.type == AIProvider::Ollama) {
            json reqBody;
            reqBody["model"] = modelID;
            reqBody["stream"] = false;
            reqBody["options"] = { {"num_predict", kPlannerMaxTokens} };
            reqBody["messages"] = json::array();
            reqBody["messages"].push_back({ {"role", "system"}, {"content", sysTxt} });
            reqBody["messages"].push_back({ {"role", "user"}, {"content", prompt} });

            std::string res = AgentHttpOllama("POST", L"/api/chat", reqBody.dump());
            rawResOrError = res;
            try {
                auto j = json::parse(res);
                if (j.contains("message") && j["message"].contains("content")) {
                    finalResp = j["message"]["content"].get<std::string>();
                }
            }
            catch (...) {}
        }
        else {
            std::wstring domain = L"api.openai.com";
            std::wstring path = L"/v1/chat/completions";
            std::vector<std::wstring> heads;

            if (prov.type == AIProvider::OpenAIUser && useOauth) {
                domain = L"chatgpt.com"; path = L"/backend-api/codex/responses";
                heads.push_back(L"Authorization: Bearer " + s2ws(auth.access));
                heads.push_back(L"Accept: text/event-stream");
                if (!auth.accountId.empty()) heads.push_back(L"ChatGPT-Account-Id: " + s2ws(auth.accountId));

                json reqBody;
                reqBody["model"] = modelID;
                reqBody["instructions"] = sysTxt;
                reqBody["store"] = false;
                reqBody["stream"] = true;
                reqBody["input"] = json::array();

                json last;
                last["role"] = "user";
                last["content"] = json::array();
                last["content"].push_back({ {"type", "input_text"}, {"text", prompt} });
                reqBody["input"].push_back(last);

                std::string res = AgentHttpRequest(domain, path, "POST", reqBody.dump(), heads);
                rawResOrError = res;

                if (!json::accept(res)) {
                    finalResp = SseText(res);
                }
                else {
                    try {
                        auto j = json::parse(res);
                        if (j.contains("output_text") && j["output_text"].is_string()) {
                            finalResp = j["output_text"].get<std::string>();
                        }
                        else if (j.contains("output") && j["output"].is_array()) {
                            for (const auto& item : j["output"]) {
                                if (!item.contains("content") || !item["content"].is_array()) continue;
                                for (const auto& c : item["content"]) {
                                    if (c.contains("text") && c["text"].is_string()) {
                                        finalResp = c["text"].get<std::string>();
                                        break;
                                    }
                                }
                                if (!finalResp.empty()) break;
                            }
                        }
                    }
                    catch (...) {}
                }
            }
            else if (prov.type == AIProvider::Anthropic) {
                domain = L"api.anthropic.com"; path = L"/v1/messages";
                heads.push_back(L"x-api-key: " + s2ws(apiKey));
                heads.push_back(L"anthropic-version: 2023-06-01");

                json reqBody;
                reqBody["model"] = modelID;
                reqBody["max_tokens"] = kPlannerMaxTokens;
                reqBody["system"] = sysTxt;
                reqBody["messages"] = json::array();
                reqBody["messages"].push_back({ {"role", "user"}, {"content", prompt} });

                std::string res = AgentHttpRequest(domain, path, "POST", reqBody.dump(), heads);
                rawResOrError = res;
                try {
                    auto j = json::parse(res);
                    if (j.contains("content") && !j["content"].empty()) {
                        finalResp = j["content"][0]["text"].get<std::string>();
                    }
                }
                catch (...) {}
            }
            else {
                if (prov.type == AIProvider::DeepSeek) domain = L"api.deepseek.com";
                else if (prov.type == AIProvider::Moonshot) domain = L"api.moonshot.ai";
                else if (prov.type == AIProvider::OpenRouter) { domain = L"openrouter.ai"; path = L"/api/v1/chat/completions"; }

                heads.push_back(L"Authorization: Bearer " + s2ws(apiKey));

                json reqBody;
                reqBody["model"] = modelID;
                reqBody["max_tokens"] = kPlannerMaxTokens;
                reqBody["messages"] = json::array();
                reqBody["messages"].push_back({ {"role", "system"}, {"content", sysTxt} });
                reqBody["messages"].push_back({ {"role", "user"}, {"content", prompt} });

                std::string res = AgentHttpRequest(domain, path, "POST", reqBody.dump(), heads);
                rawResOrError = res;
                try {
                    auto j = json::parse(res);
                    if (j.contains("choices") && !j["choices"].empty()) {
                        finalResp = j["choices"][0]["message"]["content"].get<std::string>();
                    }
                }
                catch (...) {}
            }
        }

        if (finalResp == "[]" || finalResp.empty()) {
            if (rawResOrError.find("\"error\"") != std::string::npos) return rawResOrError;
            if (finalResp.empty()) return rawResOrError;
        }

        size_t start = finalResp.find("```json");
        if (start != std::string::npos) {
            size_t end = finalResp.find("```", start + 7);
            if (end != std::string::npos) {
                return finalResp.substr(start + 7, end - (start + 7));
            }
        }
        size_t start2 = finalResp.find("```");
        if (start2 != std::string::npos) {
            size_t end2 = finalResp.find("```", start2 + 3);
            if (end2 != std::string::npos) {
                return finalResp.substr(start2 + 3, end2 - (start2 + 3));
            }
        }

        return finalResp;
    }

    std::vector<AgentAction> ParsePlan(const std::string& jsonStr) {
        std::vector<AgentAction> res;
        try {
            auto j = json::parse(jsonStr);
            if (j.is_array()) {
                for (const auto& item : j) {
                    AgentAction a;
                    a.action = item.value("action", "");
                    a.value = item.value("value", "");
                    if (item.contains("locator") && item["locator"].is_object()) {
                        a.locator = item["locator"];
                    }
                    else {
                        a.locator = json::object();
                    }
                    res.push_back(a);
                }
            }
        }
        catch (...) {}
        return res;
    }

    WORD ParseKeyName(const std::string& keyName) {
        if (keyName == "enter" || keyName == "return") return VK_RETURN;
        if (keyName == "tab") return VK_TAB;
        if (keyName == "escape" || keyName == "esc") return VK_ESCAPE;
        if (keyName == "backspace") return VK_BACK;
        if (keyName == "delete" || keyName == "del") return VK_DELETE;
        if (keyName == "space") return VK_SPACE;
        if (keyName == "up") return VK_UP;
        if (keyName == "down") return VK_DOWN;
        if (keyName == "left") return VK_LEFT;
        if (keyName == "right") return VK_RIGHT;
        if (keyName == "home") return VK_HOME;
        if (keyName == "end") return VK_END;
        if (keyName == "pageup") return VK_PRIOR;
        if (keyName == "pagedown") return VK_NEXT;
        if (keyName == "f1") return VK_F1;
        if (keyName == "f2") return VK_F2;
        if (keyName == "f3") return VK_F3;
        if (keyName == "f4") return VK_F4;
        if (keyName == "f5") return VK_F5;
        if (keyName == "f11") return VK_F11;
        if (keyName == "f12") return VK_F12;
        if (keyName.length() == 1) {
            return (WORD)VkKeyScanA(keyName[0]);
        }
        return 0;
    }

    void HumanType(const std::string& text) {
        if (text.empty()) return;

        auto ForceFG = [](HWND hwnd) {
            if (!hwnd || !IsWindow(hwnd)) return;
            DWORD targetTid = GetWindowThreadProcessId(hwnd, NULL);
            DWORD curTid = GetCurrentThreadId();
            if (targetTid != curTid) AttachThreadInput(curTid, targetTid, TRUE);
            BringWindowToTop(hwnd);
            SetForegroundWindow(hwnd);
            SetFocus(hwnd);
            if (targetTid != curTid) AttachThreadInput(curTid, targetTid, FALSE);
            Sleep(60);
        };

        auto TypeSendKey = [](WORD vk, bool keyUp) {
            INPUT inp = {};
            inp.type = INPUT_KEYBOARD;
            inp.ki.wVk = vk;
            inp.ki.wScan = (WORD)MapVirtualKeyW(vk, MAPVK_VK_TO_VSC);
            inp.ki.dwFlags = (keyUp ? KEYEVENTF_KEYUP : 0);
            if (vk == VK_UP || vk == VK_DOWN || vk == VK_LEFT || vk == VK_RIGHT ||
                vk == VK_HOME || vk == VK_END || vk == VK_PRIOR || vk == VK_NEXT ||
                vk == VK_INSERT || vk == VK_DELETE || vk == VK_NUMLOCK) {
                inp.ki.dwFlags |= KEYEVENTF_EXTENDEDKEY;
            }
            SendInput(1, &inp, sizeof(INPUT));
        };

        auto SendUnicode = [](wchar_t wc) {
            INPUT inp[2] = {};
            inp[0].type = INPUT_KEYBOARD;
            inp[0].ki.wScan = wc;
            inp[0].ki.dwFlags = KEYEVENTF_UNICODE;
            inp[1].type = INPUT_KEYBOARD;
            inp[1].ki.wScan = wc;
            inp[1].ki.dwFlags = KEYEVENTF_UNICODE | KEYEVENTF_KEYUP;
            SendInput(2, inp, sizeof(INPUT));
        };

        std::mt19937 rng((unsigned)GetTickCount64());
        std::uniform_int_distribution<int> charDelay(25, 45);
        std::uniform_int_distribution<int> lineDelay(80, 150);

        ForceFG(targetWindow);
        Sleep(100);

        size_t i = 0;
        size_t len = text.size();
        while (i < len && isRunning) {
            char c = text[i];

            if (c == '\r') { i++; continue; }

            if (c == '\n') {
                TypeSendKey(VK_RETURN, false);
                Sleep(15);
                TypeSendKey(VK_RETURN, true);
                Sleep(lineDelay(rng));
                i++;
                continue;
            }

            if (c == '\t') {
                TypeSendKey(VK_TAB, false);
                Sleep(15);
                TypeSendKey(VK_TAB, true);
                Sleep(charDelay(rng));
                i++;
                continue;
            }

            SHORT vkResult = VkKeyScanA(c);
            if (vkResult != -1) {
                BYTE vk = LOBYTE(vkResult);
                BYTE mods = HIBYTE(vkResult);
                bool needShift = (mods & 1) != 0;
                bool needCtrl = (mods & 2) != 0;
                bool needAlt = (mods & 4) != 0;

                if (needCtrl) TypeSendKey(VK_CONTROL, false);
                if (needAlt) TypeSendKey(VK_MENU, false);
                if (needShift) TypeSendKey(VK_SHIFT, false);

                TypeSendKey(vk, false);
                Sleep(10);
                TypeSendKey(vk, true);

                if (needShift) TypeSendKey(VK_SHIFT, true);
                if (needAlt) TypeSendKey(VK_MENU, true);
                if (needCtrl) TypeSendKey(VK_CONTROL, true);
            }
            else {
                wchar_t wc = 0;
                int converted = MultiByteToWideChar(CP_UTF8, 0, &text[i], -1, &wc, 1);
                if (converted > 0) {
                    SendUnicode(wc);
                }
            }

            Sleep(charDelay(rng));
            i++;
        }
    }

    bool ExecuteAction(const AgentAction& action) {
        auto ForceForeground = [](HWND hwnd) {
            if (!hwnd || !IsWindow(hwnd)) return;
            DWORD targetTid = GetWindowThreadProcessId(hwnd, NULL);
            DWORD curTid = GetCurrentThreadId();
            if (targetTid != curTid) AttachThreadInput(curTid, targetTid, TRUE);
            BringWindowToTop(hwnd);
            SetForegroundWindow(hwnd);
            SetFocus(hwnd);
            if (targetTid != curTid) AttachThreadInput(curTid, targetTid, FALSE);
            Sleep(60);
        };

        auto SendKey = [](WORD vk, bool keyUp) {
            INPUT inp = {};
            inp.type = INPUT_KEYBOARD;
            inp.ki.wVk = vk;
            inp.ki.wScan = (WORD)MapVirtualKeyW(vk, MAPVK_VK_TO_VSC);
            inp.ki.dwFlags = (keyUp ? KEYEVENTF_KEYUP : 0);
            if (vk == VK_UP || vk == VK_DOWN || vk == VK_LEFT || vk == VK_RIGHT ||
                vk == VK_HOME || vk == VK_END || vk == VK_PRIOR || vk == VK_NEXT ||
                vk == VK_INSERT || vk == VK_DELETE || vk == VK_NUMLOCK) {
                inp.ki.dwFlags |= KEYEVENTF_EXTENDEDKEY;
            }
            SendInput(1, &inp, sizeof(INPUT));
        };

        auto SyncGlobalTarget = [this]() {
            if (!isSubAgent) {
                g_targetWindow = targetWindow;
                g_targetProcessName = targetProcessName;
            }
        };

        if (action.action == "list_processes") {
            RefreshProcessList();
            auto list = GetProcessListSnapshot();
            std::string output = "AVAILABLE PROCESSES:\n";
            for (size_t i = 0; i < list.size(); i++) {
                output += std::to_string(i + 1) + ". " + list[i].processName + " - \"" + list[i].title + "\"";
                if (list[i].hwnd == targetWindow) output += " [ATTACHED]";
                output += "\n";
            }
            if (list.empty()) output += "(No visible windows found)\n";
            lastActionResult = output;
            return true;
        }

        if (action.action == "switch_window" || action.action == "attach_process") {
            if (lockTargetWindow) {
                lastActionResult = "Worker target is pinned; switch/attach is disabled.";
                return false;
            }
            std::string targetTitle = action.value;

            // Numeric selection support
            {
                std::string trimmed = targetTitle;
                size_t first = trimmed.find_first_not_of(" \t\n\r");
                if (first == std::string::npos) trimmed.clear();
                else {
                    trimmed.erase(0, first);
                    size_t last = trimmed.find_last_not_of(" \t\n\r");
                    if (last != std::string::npos) trimmed.erase(last + 1);
                }
                bool allDigits = !trimmed.empty() && std::all_of(trimmed.begin(), trimmed.end(), [](unsigned char c) { return std::isdigit(c) != 0; });
                if (allDigits) {
                    int idx = 0;
                    try { idx = std::stoi(trimmed); }
                    catch (...) { idx = 0; }
                    if (idx > 0) {
                        RefreshProcessList();
                        ProcessInfo picked;
                        if (GetProcessByIndex(idx, picked)) {
                            HWND hw = picked.hwnd;
                            if (hw && IsWindow(hw)) {
                                targetWindow = hw;
                                targetProcessName = picked.processName;
                                SyncGlobalTarget();
                                if (IsIconic(targetWindow)) ShowWindow(targetWindow, SW_RESTORE);
                                ForceForeground(targetWindow);
                                Sleep(200);
                                return true;
                            }
                        }
                    }
                }
            }

            struct FindData { std::string title; HWND result; };
            FindData fd = { targetTitle, NULL };

            EnumWindows([](HWND hw, LPARAM lp) -> BOOL {
                auto* data = (FindData*)lp;
                if (!IsWindowVisible(hw)) return TRUE;
                if (hw == g_agentWindow || hw == GetShellWindow()) return TRUE;

                LONG_PTR style = GetWindowLongPtr(hw, GWL_STYLE);
                LONG_PTR exStyle = GetWindowLongPtr(hw, GWL_EXSTYLE);
                if (style & WS_CHILD) return TRUE;
                if (exStyle & WS_EX_TOOLWINDOW) return TRUE;
                if (GetWindow(hw, GW_OWNER) != NULL) return TRUE;

                char title[256] = {};
                GetWindowTextA(hw, title, sizeof(title));
                std::string t(title);

                std::string proc = "";
                DWORD pid = 0;
                GetWindowThreadProcessId(hw, &pid);
                if (pid) {
                    HANDLE hProc = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, pid);
                    if (hProc) {
                        char pname[MAX_PATH] = {};
                        HMODULE hMod; DWORD cbNeeded;
                        if (EnumProcessModules(hProc, &hMod, sizeof(hMod), &cbNeeded))
                            GetModuleBaseNameA(hProc, hMod, pname, sizeof(pname));
                        CloseHandle(hProc);
                        proc = pname;
                    }
                }

                std::string tLower = t, searchLower = data->title;
                std::transform(tLower.begin(), tLower.end(), tLower.begin(), ::tolower);
                std::transform(searchLower.begin(), searchLower.end(), searchLower.begin(), ::tolower);
                std::string pLower = proc;
                std::transform(pLower.begin(), pLower.end(), pLower.begin(), ::tolower);

                if (!searchLower.empty() && (tLower.find(searchLower) != std::string::npos || pLower.find(searchLower) != std::string::npos)) {
                    data->result = hw;
                    return FALSE;
                }
                return TRUE;
                }, (LPARAM)&fd);

            if (fd.result) {
                targetWindow = fd.result;
                char pname[MAX_PATH] = {};
                DWORD pid = 0;
                GetWindowThreadProcessId(fd.result, &pid);
                HANDLE hProc = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, pid);
                if (hProc) {
                    HMODULE hMod; DWORD cbNeeded;
                    if (EnumProcessModules(hProc, &hMod, sizeof(hMod), &cbNeeded))
                        GetModuleBaseNameA(hProc, hMod, pname, sizeof(pname));
                    CloseHandle(hProc);
                }
                targetProcessName = pname;
                SyncGlobalTarget();
                if (IsIconic(targetWindow)) ShowWindow(targetWindow, SW_RESTORE);
                ForceForeground(targetWindow);
                Sleep(200);
                return true;
            }
            return false;
        }

        if (action.action == "open_app") {
            if (lockTargetWindow) {
                lastActionResult = "Worker target is pinned; open_app is disabled.";
                return false;
            }
            std::string appName = action.value;
            std::string appLower = appName;
            std::transform(appLower.begin(), appLower.end(), appLower.begin(), ::tolower);

            if (appLower.find(".exe") == std::string::npos && appLower.find(".lnk") == std::string::npos) {
                appName += ".exe";
            }
            HWND launchedWindow = NULL;
            std::string launchedProc;
            if (!LaunchAppAndAttachWindow(appName, launchedWindow, launchedProc, 12000)) {
                lastActionResult = "Failed to open app: " + appName;
                return false;
            }
            targetWindow = launchedWindow;
            targetProcessName = launchedProc.empty() ? appName : launchedProc;
            SyncGlobalTarget();
            lastActionResult = "Successfully opened and attached to " + targetProcessName;
            return true;
        }

        if (action.action == "press_key") {
            std::string keyStr = action.value;
            std::transform(keyStr.begin(), keyStr.end(), keyStr.begin(), ::tolower);

            bool ctrl = false, shift = false, alt = false;
            std::string mainKey = keyStr;

            while (true) {
                if (mainKey.substr(0, 5) == "ctrl+") { ctrl = true; mainKey = mainKey.substr(5); }
                else if (mainKey.substr(0, 6) == "shift+") { shift = true; mainKey = mainKey.substr(6); }
                else if (mainKey.substr(0, 4) == "alt+") { alt = true; mainKey = mainKey.substr(4); }
                else break;
            }

            WORD vk = ParseKeyName(mainKey);
            if (vk == 0) return false;

            std::lock_guard<std::mutex> lock(g_actionExecMutex);
            ForceForeground(targetWindow);

            if (ctrl) SendKey(VK_CONTROL, false);
            if (shift) SendKey(VK_SHIFT, false);
            if (alt) SendKey(VK_MENU, false);
            Sleep(30);

            SendKey(vk, false);
            Sleep(30);
            SendKey(vk, true);
            Sleep(30);

            if (alt) SendKey(VK_MENU, true);
            if (shift) SendKey(VK_SHIFT, true);
            if (ctrl) SendKey(VK_CONTROL, true);

            return true;
        }

        if (action.action == "scroll") {
            std::string dir = action.value;
            std::transform(dir.begin(), dir.end(), dir.begin(), ::tolower);
            int scrollAmount = (dir == "up") ? 120 * 3 : -120 * 3;

            RECT targetRect;
            if (!action.locator.empty() && action.locator.is_object()) {
                CoInitializeEx(NULL, COINIT_MULTITHREADED);
                IUIAutomation* pAuto = NULL;
                CoCreateInstance(__uuidof(CUIAutomation), NULL, CLSCTX_INPROC_SERVER, __uuidof(IUIAutomation), (void**)&pAuto);
                IUIAutomationElement* pRoot = NULL;
                if (pAuto) pAuto->ElementFromHandle(targetWindow, &pRoot);
                if (pRoot) {
                    IUIAutomationElement* el = FindElement(pAuto, pRoot, action.locator);
                    if (el) {
                        el->get_CurrentBoundingRectangle(&targetRect);
                        el->Release();
                    }
                    pRoot->Release();
                }
                if (pAuto) pAuto->Release();
                CoUninitialize();
            }
            else {
                GetWindowRect(targetWindow, &targetRect);
            }
            {
                std::lock_guard<std::mutex> lock(g_actionExecMutex);
                SetCursorPos((targetRect.left + targetRect.right) / 2, (targetRect.top + targetRect.bottom) / 2);
                mouse_event(MOUSEEVENTF_WHEEL, 0, 0, (DWORD)scrollAmount, 0);
            }
            return true;
        }

        CoInitializeEx(NULL, COINIT_MULTITHREADED);
        IUIAutomation* pAutomation = NULL;
        CoCreateInstance(__uuidof(CUIAutomation), NULL, CLSCTX_INPROC_SERVER, __uuidof(IUIAutomation), (void**)&pAutomation);
        IUIAutomationElement* pRoot = NULL;
        if (pAutomation) pAutomation->ElementFromHandle(targetWindow, &pRoot);

        if (!pRoot) { if (pAutomation) pAutomation->Release(); CoUninitialize(); return false; }

        IUIAutomationElement* target = FindElement(pAutomation, pRoot, action.locator);
        bool result = false;

        if (target) {
            if (action.action == "click" || action.action == "right_click" || action.action == "double_click") {
                IUnknown* pat = NULL;
                bool usedPattern = false;

                if (action.action == "click") {
                    if (SUCCEEDED(target->GetCurrentPattern(UIA_InvokePatternId, &pat)) && pat) {
                        ((IUIAutomationInvokePattern*)pat)->Invoke();
                        pat->Release();
                        usedPattern = true; result = true;
                    }
                    if (!usedPattern && SUCCEEDED(target->GetCurrentPattern(UIA_SelectionItemPatternId, &pat)) && pat) {
                        ((IUIAutomationSelectionItemPattern*)pat)->Select();
                        pat->Release();
                        usedPattern = true; result = true;
                    }
                    if (!usedPattern && SUCCEEDED(target->GetCurrentPattern(UIA_ExpandCollapsePatternId, &pat)) && pat) {
                        ExpandCollapseState state;
                        ((IUIAutomationExpandCollapsePattern*)pat)->get_CurrentExpandCollapseState(&state);
                        if (state == ExpandCollapseState_Collapsed)
                            ((IUIAutomationExpandCollapsePattern*)pat)->Expand();
                        else
                            ((IUIAutomationExpandCollapsePattern*)pat)->Collapse();
                        pat->Release();
                        usedPattern = true; result = true;
                    }
                    if (!usedPattern && SUCCEEDED(target->GetCurrentPattern(UIA_TogglePatternId, &pat)) && pat) {
                        ((IUIAutomationTogglePattern*)pat)->Toggle();
                        pat->Release();
                        usedPattern = true; result = true;
                    }
                }

                if (!usedPattern) {
                    {
                        std::lock_guard<std::mutex> lock(g_actionExecMutex);
                        ForceForeground(targetWindow);
                        target->SetFocus();
                        RECT r; target->get_CurrentBoundingRectangle(&r);
                        int cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
                        SetCursorPos(cx, cy);
                        Sleep(50);

                        if (action.action == "right_click") {
                            mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0);
                            mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0);
                        }
                        else if (action.action == "double_click") {
                            mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
                            mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
                            Sleep(50);
                            mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
                            mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
                        }
                        else {
                            mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
                            mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
                        }
                    }
                    result = true;
                }
            }
            else if (action.action == "type") {
                IUnknown* vpat = NULL;
                if (SUCCEEDED(target->GetCurrentPattern(UIA_ValuePatternId, &vpat)) && vpat) {
                    std::wstring wideText = s2ws(action.value);
                    BSTR bText = SysAllocStringLen(wideText.c_str(), (UINT)wideText.size());
                    if (bText && SUCCEEDED(((IUIAutomationValuePattern*)vpat)->SetValue(bText))) {
                        result = true;
                    }
                    if (bText) SysFreeString(bText);
                    vpat->Release();
                }
                if (!result) {
                    UIA_HWND nativeHwnd = NULL;
                    if (SUCCEEDED(target->get_CurrentNativeWindowHandle(&nativeHwnd)) && nativeHwnd) {
                        std::wstring wideText = s2ws(action.value);
                        SendMessageW((HWND)nativeHwnd, WM_SETTEXT, 0, (LPARAM)wideText.c_str());
                        result = true;
                    }
                }
                if (!result) {
                    std::lock_guard<std::mutex> lock(g_actionExecMutex);
                    ForceForeground(targetWindow);
                    target->SetFocus();
                    Sleep(100);
                    HumanType(action.value);
                    result = true;
                }
            }
            else if (action.action == "hover") {
                std::lock_guard<std::mutex> lock(g_actionExecMutex);
                target->SetFocus();
                RECT r; target->get_CurrentBoundingRectangle(&r);
                SetCursorPos((r.left + r.right) / 2, (r.top + r.bottom) / 2);
                Sleep(500);
                result = true;
            }
            target->Release();
        }

        pRoot->Release();
        pAutomation->Release();
        CoUninitialize();

        if (action.action == "wait_for") {
            bool elementFound = false;
            for (int attempt = 0; attempt < 20 && !elementFound && isRunning; attempt++) {
                Sleep(500);
                CoInitializeEx(NULL, COINIT_MULTITHREADED);
                IUIAutomation* pA2 = NULL;
                CoCreateInstance(__uuidof(CUIAutomation), NULL, CLSCTX_INPROC_SERVER, __uuidof(IUIAutomation), (void**)&pA2);
                if (pA2) {
                    IUIAutomationElement* pR2 = NULL;
                    pA2->ElementFromHandle(targetWindow, &pR2);
                    if (pR2) {
                        IUIAutomationElement* el = FindElement(pA2, pR2, action.locator);
                        if (el) { elementFound = true; el->Release(); }
                        pR2->Release();
                    }
                    pA2->Release();
                }
                CoUninitialize();
            }
            return elementFound;
        }


        if (action.action == "clipboard") {
            std::string op = action.value;
            std::transform(op.begin(), op.end(), op.begin(), ::tolower);
            std::lock_guard<std::mutex> lock(g_actionExecMutex);
            ForceForeground(targetWindow);
            if (op == "copy") {
                SendKey(VK_CONTROL, false); Sleep(30);
                SendKey('C', false); Sleep(20); SendKey('C', true); Sleep(30);
                SendKey(VK_CONTROL, true);
                return true;
            }
            else if (op == "paste") {
                SendKey(VK_CONTROL, false); Sleep(30);
                SendKey('V', false); Sleep(20); SendKey('V', true); Sleep(30);
                SendKey(VK_CONTROL, true);
                return true;
            }
            else if (op == "cut") {
                SendKey(VK_CONTROL, false); Sleep(30);
                SendKey('X', false); Sleep(20); SendKey('X', true); Sleep(30);
                SendKey(VK_CONTROL, true);
                return true;
            }
            else if (op == "select_all") {
                SendKey(VK_CONTROL, false); Sleep(30);
                SendKey('A', false); Sleep(20); SendKey('A', true); Sleep(30);
                SendKey(VK_CONTROL, true);
                return true;
            }
            SetClipboardText(action.value);
            return true;
        }

        return result;
    }

    IUIAutomationElement* FindElement(IUIAutomation* pAuto, IUIAutomationElement* root, json locator) {
        IUIAutomationTreeWalker* pWalker = NULL;
        pAuto->get_ControlViewWalker(&pWalker);
        if (!pWalker) return NULL;

        std::vector<IUIAutomationElement*> q;
        root->AddRef();
        q.push_back(root);

        std::string locName = locator.value("name", "");
        std::string locType = locator.value("controlType", "");
        std::string locId = locator.value("automationId", "");

        IUIAutomationElement* bestMatch = NULL;
        int bestScore = 0;
        const int MIN_SCORE = 15;

        int checked = 0;
        int head = 0;

        while (head < (int)q.size() && checked < 800) {
            IUIAutomationElement* curr = q[head++];
            checked++;

            if (checked > 1) {
                int score = 0;

                if (!locId.empty()) {
                    BSTR bId = NULL; curr->get_CurrentAutomationId(&bId);
                    std::string elemId = BstrToStdString(bId);
                    SysFreeString(bId);
                    if (!elemId.empty()) {
                        if (elemId == locId) score += 50;
                    }
                }

                if (!locName.empty()) {
                    BSTR bName = NULL; curr->get_CurrentName(&bName);
                    std::string elemName = BstrToStdString(bName);
                    SysFreeString(bName);
                    if (!elemName.empty()) {
                        if (elemName == locName) score += 30;
                        else if (!CaselessFind(elemName, locName).empty()) score += 15;
                    }
                }

                if (!locType.empty()) {
                    CONTROLTYPEID ct = 0; curr->get_CurrentControlType(&ct);
                    std::string ctStr = ControlTypeIdToString(ct);
                    if (ctStr == locType) score += 20;
                }

                if (score > bestScore && score >= MIN_SCORE) {
                    if (bestMatch) bestMatch->Release();
                    bestMatch = curr;
                    bestMatch->AddRef();
                    bestScore = score;

                    int maxPossible = 0;
                    if (!locId.empty()) maxPossible += 50;
                    if (!locName.empty()) maxPossible += 30;
                    if (!locType.empty()) maxPossible += 20;
                    if (score >= maxPossible) {
                        curr->Release();
                        for (size_t i = head; i < q.size(); i++) q[i]->Release();
                        pWalker->Release();
                        return bestMatch;
                    }
                }
            }

            IUIAutomationElement* child = NULL;
            pWalker->GetFirstChildElement(curr, &child);
            while (child) {
                q.push_back(child);
                IUIAutomationElement* next = NULL;
                pWalker->GetNextSiblingElement(child, &next);
                child = next;
            }

            if (curr != bestMatch) curr->Release();
        }

        pWalker->Release();
        for (size_t i = head; i < q.size(); i++) {
            if (q[i] != bestMatch) q[i]->Release();
        }

        return bestMatch;
    }
};

std::mutex g_subAgentMutex;
std::unordered_map<int, std::unique_ptr<AgentCore>> g_subAgents;
std::atomic<int> g_nextSubAgentId(1);
const int kMaxSubAgents = 8;

static int ClampPlannerTokenBudget(int v) {
    if (v < 128) return 128;
    if (v > 2048) return 2048;
    return v;
}

static bool TryExtractJsonValue(const std::string& raw, std::string& out) {
    size_t objPos = raw.find('{');
    size_t arrPos = raw.find('[');
    size_t start = std::string::npos;
    char open = 0;
    char close = 0;

    if (objPos == std::string::npos && arrPos == std::string::npos) return false;
    if (objPos == std::string::npos || (arrPos != std::string::npos && arrPos < objPos)) {
        start = arrPos;
        open = '[';
        close = ']';
    }
    else {
        start = objPos;
        open = '{';
        close = '}';
    }

    int depth = 0;
    bool inString = false;
    bool escaped = false;
    for (size_t i = start; i < raw.size(); i++) {
        char c = raw[i];
        if (inString) {
            if (escaped) {
                escaped = false;
            }
            else if (c == '\\') {
                escaped = true;
            }
            else if (c == '"') {
                inString = false;
            }
            continue;
        }

        if (c == '"') {
            inString = true;
            continue;
        }

        if (c == open) depth++;
        else if (c == close) {
            depth--;
            if (depth == 0) {
                out = raw.substr(start, i - start + 1);
                return true;
            }
        }
    }
    return false;
}

static bool ActionNeedsUiChange(const AgentAction& action) {
    return action.action == "click" || action.action == "double_click" || action.action == "right_click" ||
        action.action == "type" || action.action == "press_key" || action.action == "scroll" ||
        action.action == "switch_window" || action.action == "attach_process" || action.action == "open_app";
}

static bool ParsePlannerResponseStrict(const std::string& raw, PlannerResponse& out) {
    out = PlannerResponse{};
    try {
        json j;
        if (json::accept(raw)) {
            j = json::parse(raw);
        }
        else {
            std::string extracted;
            if (!TryExtractJsonValue(raw, extracted) || !json::accept(extracted)) {
                out.parseError = "Planner output is not valid JSON.";
                return false;
            }
            j = json::parse(extracted);
        }
        if (j.is_array()) {
            for (const auto& item : j) {
                if (!item.is_object()) continue;
                if (!item.contains("action") || !item["action"].is_string()) continue;
                AgentAction a;
                a.action = item["action"].get<std::string>();
                if (item.contains("value") && item["value"].is_string()) a.value = item["value"].get<std::string>();
                if (item.contains("locator") && item["locator"].is_object()) a.locator = item["locator"];
                else a.locator = json::object();
                out.actions.push_back(a);
            }
            if (out.actions.empty()) {
                out.parseError = "Planner returned empty action array.";
                return false;
            }
            out.valid = true;
            return true;
        }
        if (!j.is_object()) {
            out.parseError = "Planner JSON root must be object or array.";
            return false;
        }

        if (j.contains("error")) {
            out.parseError = std::string("Planner/API error: ") + j["error"].dump();
            return false;
        }
        if (j.contains("status") && j["status"].is_string()) {
            std::string st = j["status"].get<std::string>();
            if (st == "failed" || st == "error") {
                out.parseError = "Planner/API status: " + st;
                return false;
            }
        }

        if (j.contains("reasoning") && j["reasoning"].is_string()) out.reasoning = j["reasoning"].get<std::string>();
        if (j.contains("next_goal") && j["next_goal"].is_string()) out.nextGoal = j["next_goal"].get<std::string>();
        if (j.contains("is_done") && j["is_done"].is_boolean()) out.isDone = j["is_done"].get<bool>();
        if (j.contains("confidence") && j["confidence"].is_number()) out.confidence = j["confidence"].get<float>();
        if (j.contains("token_budget") && j["token_budget"].is_number_integer()) out.tokenBudget = j["token_budget"].get<int>();

        if (j.contains("actions")) {
            if (!j["actions"].is_array()) {
                out.parseError = "'actions' must be an array.";
                return false;
            }
            for (const auto& item : j["actions"]) {
                if (!item.is_object() || !item.contains("action") || !item["action"].is_string()) continue;
                AgentAction a;
                a.action = item["action"].get<std::string>();
                if (item.contains("value") && item["value"].is_string()) a.value = item["value"].get<std::string>();
                if (item.contains("locator") && item["locator"].is_object()) a.locator = item["locator"];
                else a.locator = json::object();
                out.actions.push_back(a);
            }
        }

        if (!out.isDone && out.actions.empty()) {
            std::string reason = out.reasoning.empty() ? "(none)" : out.reasoning;
            out.parseError = "Planner returned no actions while is_done=false. Reasoning: " + reason;
            return false;
        }

        out.valid = true;
        return true;
    }
    catch (const std::exception& ex) {
        out.parseError = std::string("Planner parse exception: ") + ex.what();
        return false;
    }
    catch (...) {
        out.parseError = "Planner parse exception.";
        return false;
    }
}

static int SpawnSubAgentFromAgent(int parentSessionId, HWND parentTarget, const std::string& parentTargetProcess, int parentTokenBudget, const std::string& subGoal) {
    if (subGoal.empty()) return 0;

    std::lock_guard<std::mutex> lock(g_subAgentMutex);
    int running = 0;
    for (auto& kv : g_subAgents) {
        if (kv.second && kv.second->isRunning) running++;
    }
    if (running >= kMaxSubAgents) return 0;

    int id = g_nextSubAgentId.fetch_add(1);
    auto child = std::make_unique<AgentCore>();
    child->ConfigureSession(id, parentSessionId, true, parentTarget, parentTargetProcess, parentTokenBudget);
    child->ConfigureWorkerSlot(0, 0);
    child->Start(subGoal);
    g_subAgents[id] = std::move(child);
    return id;
}

static int SpawnDedicatedSubAgent(int parentSessionId, const CoordinatorParallelRequest& req, int workerNumber, int parentTokenBudget) {
    if (!req.valid || req.appExe.empty() || req.task.empty()) return 0;

    HWND hwnd = NULL;
    std::string procName;
    if (!LaunchAppAndAttachWindow(req.appExe, hwnd, procName, 12000)) return 0;
    if (!hwnd || !IsWindow(hwnd)) return 0;

    std::lock_guard<std::mutex> lock(g_subAgentMutex);
    int running = 0;
    for (auto& kv : g_subAgents) {
        if (kv.second && kv.second->isRunning) running++;
    }
    if (running >= kMaxSubAgents) return 0;

    int id = g_nextSubAgentId.fetch_add(1);
    auto child = std::make_unique<AgentCore>();
    child->ConfigureSession(id, parentSessionId, true, hwnd, procName.empty() ? req.appExe : procName, parentTokenBudget);
    child->ConfigureWorkerSlot(workerNumber, req.workerCount);
    std::string workerGoal = req.task + "\nYou are worker " + std::to_string(workerNumber) + " of " + std::to_string(req.workerCount) + ". Complete the task in this assigned app window only.";
    child->Start(workerGoal);
    g_subAgents[id] = std::move(child);
    return id;
}

extern AgentCore g_agent;

static int StartCoordinatorParallelGoal(const std::string& goal) {
    CoordinatorParallelRequest req = ParseCoordinatorParallelRequest(goal);
    if (!req.valid) return 0;

    int targetWorkers = (req.workerCount < kMaxSubAgents) ? req.workerCount : kMaxSubAgents;
    int spawned = 0;
    {
        std::lock_guard<std::mutex> lock(g_agentMutex);
        g_agent.currentGoal = goal;
        g_agent.targetProcessName = req.appExe;
        g_agent.statusMessage = "Coordinator: spawning " + std::to_string(targetWorkers) + " workers for " + req.appExe + "...";
    }

    for (int i = 1; i <= targetWorkers; i++) {
        int id = SpawnDedicatedSubAgent(0, req, i, 512);
        if (id > 0) spawned++;
    }

    {
        std::lock_guard<std::mutex> lock(g_agentMutex);
        if (spawned > 0) {
            g_agent.statusMessage = "Coordinator: spawned " + std::to_string(spawned) + "/" + std::to_string(targetWorkers) + " workers.";
        }
        else {
            g_agent.statusMessage = "Coordinator: failed to spawn workers.";
        }
    }

    return spawned;
}

static int CountRunningSubAgents() {
    std::lock_guard<std::mutex> lock(g_subAgentMutex);
    int running = 0;
    for (auto& kv : g_subAgents) {
        if (kv.second && kv.second->isRunning) running++;
    }
    return running;
}

static void StopAllSubAgents() {
    std::lock_guard<std::mutex> lock(g_subAgentMutex);
    for (auto& kv : g_subAgents) {
        if (kv.second && kv.second->isRunning) kv.second->Stop();
    }
}

static void CleanupFinishedSubAgents() {
    std::lock_guard<std::mutex> lock(g_subAgentMutex);
    for (auto it = g_subAgents.begin(); it != g_subAgents.end();) {
        if (!it->second || it->second->threadExited.load()) it = g_subAgents.erase(it);
        else ++it;
    }
}

AgentCore g_agent;

void TelegramProcessCommandImpl(const std::string& chatId, const std::string& rawText) {
    std::string text = rawText;
    size_t first = text.find_first_not_of(" \t\n\r");
    if (first == std::string::npos) {
        text.clear();
    }
    else {
        text.erase(0, first);
        size_t last = text.find_last_not_of(" \t\n\r");
        if (last != std::string::npos) text.erase(last + 1);
    }

    if (text == "/help" || text == "/start") {
        TelegramBridge::SendMessage(
            "[COMMANDS]\n"
            "/run <goal> - Run the agent with a goal\n"
            "/apps - List running applications\n"
            "/screenshot - Take a screenshot\n"
            "/hide - Hide the app window\n"
            "/unhide - Show the app window\n"
            "/status - Show agent status\n"
            "/stop - Stop the agent\n"
            "/help - Show this message"
        );
        return;
    }

    if (text == "/hide") {
        if (g_agentWindow) {
            PostMessage(g_agentWindow, WM_APP + 3, 0, 0);
            TelegramBridge::SendMessage("[OK] App hidden.");
        }
        else {
            TelegramBridge::SendMessage("[ERROR] App window handle not available.");
        }
        return;
    }

    if (text == "/unhide") {
        if (g_agentWindow) {
            PostMessage(g_agentWindow, WM_APP + 3, 1, 0);
            TelegramBridge::SendMessage("[OK] App shown.");
        }
        else {
            TelegramBridge::SendMessage("[ERROR] App window handle not available.");
        }
        return;
    }

    if (text == "/status") {
        int runningWorkers = CountRunningSubAgents();
        std::string status = "[STATUS]\n";
        status += "Running: " + std::string((g_agent.isRunning || runningWorkers > 0) ? "Yes" : "No") + "\n";
        status += "Paused: " + std::string(g_agent.isPaused ? "Yes" : "No") + "\n";
        status += "Sub-agents: " + std::to_string(runningWorkers) + " running\n";
        if (!g_agent.currentGoal.empty()) status += "Goal: " + g_agent.currentGoal + "\n";
        status += "Status: " + g_agent.statusMessage + "\n";
        if (g_targetWindow && IsWindow(g_targetWindow)) {
            char title[256] = {};
            GetWindowTextA(g_targetWindow, title, sizeof(title));
            status += "Attached: " + std::string(title) + "\n";
        }
        else {
            status += "Attached: None\n";
        }
        TelegramBridge::SendMessage(status);
        return;
    }

    if (text == "/stop") {
        if (g_agent.isRunning || CountRunningSubAgents() > 0) {
            g_agent.Stop();
            StopAllSubAgents();
            TelegramBridge::SendMessage("[STOPPED] Agent and sub-agents stopped.");
        }
        else {
            TelegramBridge::SendMessage("Agent is not running.");
        }
        return;
    }

    if (text == "/apps") {
        TelegramBridge::SendMessage("[APPS] Fetching process list...");
        RefreshProcessList();
        auto list = GetProcessListSnapshot();

        if (list.empty()) {
            TelegramBridge::SendMessage("[APPS] No running applications found (or all filtered out).");
            return;
        }

        std::string msg = "[APPS] Running Applications:\n";
        for (size_t i = 0; i < list.size(); i++) {
            std::string line = std::to_string(i + 1) + ". " + list[i].processName + " - " + list[i].title;
            if (list[i].hwnd == g_targetWindow) line += " [ATTACHED]";
            line += "\n";

            if (msg.length() + line.length() > 4000) {
                TelegramBridge::SendMessage(msg);
                msg = "[APPS] (Cont...)\n";
            }
            msg += line;
        }
        msg += "\nReply with a number to attach to that app.";
        g_telegramState = TelegramState::WaitingForAppSelection;
        TelegramBridge::SendMessage(msg);
        return;
    }

    if (text == "/screenshot") {
        CaptureScreenshot();
        TelegramBridge::SendMessage("[SCREENSHOT] Screenshot captured and saved locally.");
        return;
    }

    if (text.substr(0, 4) == "/run" && text.size() > 5) {
        std::string goal = text.substr(5);
        if (g_agent.isRunning || CountRunningSubAgents() > 0) {
            TelegramBridge::SendMessage("Agent is already running! Use /stop first.");
            return;
        }
        StartGoal(goal);
        TelegramBridge::SendMessage("[STARTED] Goal: " + goal);
        return;
    }

    if (g_telegramState == TelegramState::WaitingForAppSelection) {
        try {
            int idx = std::stoi(text);
            ProcessInfo proc;
            if (GetProcessByIndex(idx, proc)) {
                g_targetWindow = proc.hwnd;
                g_targetProcessName = proc.processName;
                if (IsIconic(g_targetWindow)) ShowWindow(g_targetWindow, SW_RESTORE);
                SetForegroundWindow(g_targetWindow);
                TelegramBridge::SendMessage("[ATTACHED] " + proc.processName + " - " + proc.title);
                g_telegramState = TelegramState::Idle;
                return;
            }
        }
        catch (...) {}
        g_telegramState = TelegramState::Idle;
    }

    if (!text.empty() && text[0] != '/') {
        if (g_agent.isRunning || CountRunningSubAgents() > 0) {
            TelegramBridge::SendMessage("Agent is busy. Use /stop first.");
        }
        else {
            StartGoal(text);
            TelegramBridge::SendMessage("[STARTED] Goal: " + text);
        }
        return;
    }

    TelegramBridge::SendMessage("Unknown command. Use /help for available commands.");
}

void RenderProcessSelector(const ImVec4& accentColor) {
    if (!g_showProcessSelector) return;

    ImGui::OpenPopup("Select Process");
    ImGui::SetNextWindowSize(ImVec2(450, 450), ImGuiCond_FirstUseEver);
    if (ImGui::BeginPopupModal("Select Process", &g_showProcessSelector)) {
        ImGui::TextColored(accentColor, "SELECT TARGET PROCESS");
        ImGui::Separator();
        ImGui::Spacing();

        if (ImGui::BeginChild("ProcList", ImVec2(0, -40), true)) {
            auto list = GetProcessListSnapshot();
            for (const auto& proc : list) {
                char label[512];
                sprintf(label, "[%05lu] %s - %s##%p", (unsigned long)proc.pid, proc.processName.c_str(), proc.title.c_str(), proc.hwnd);
                if (ImGui::Selectable(label, g_targetWindow == proc.hwnd)) {
                    g_targetWindow = proc.hwnd;
                    g_targetProcessName = proc.processName;
                    g_showProcessSelector = false;
                }
            }
            ImGui::EndChild();
        }

        if (ImGui::Button("REFRESH", ImVec2(100, 30))) {
            RefreshProcessList();
        }
        ImGui::SameLine();
        if (ImGui::Button("CLOSE", ImVec2(100, 30))) {
            g_showProcessSelector = false;
        }

        ImGui::EndPopup();
    }
}


} // namespace

void Init(HWND hwnd) { g_agentWindow = hwnd; }

void Shutdown() {
    StopPolling();
    if (g_agent.isRunning) g_agent.Stop();
    StopAllSubAgents();
    CleanupFinishedSubAgents();
}

void StartPolling() { TelegramBridge::StartPolling(); }
void StopPolling() { TelegramBridge::StopPolling(); }
bool IsPolling() { return g_telegramPolling; }

void SetTelegramToken(const std::string& token) { g_telegramToken = token; }
void SetTelegramChatId(const std::string& chatId) { g_telegramChatId = chatId; }
void SetTelegramEnabled(bool enabled) { g_telegramEnabled = enabled; }

const std::string& GetTelegramToken() { return g_telegramToken; }
const std::string& GetTelegramChatId() { return g_telegramChatId; }
bool IsTelegramEnabled() { return g_telegramEnabled; }

bool IsExecuting() {
    CleanupFinishedSubAgents();
    return g_agentExecuting.load();
}

void StartGoal(const std::string& goal) {
    if (goal.empty()) return;
    if (g_agent.isRunning || CountRunningSubAgents() > 0) return;
    CleanupFinishedSubAgents();

    int spawned = StartCoordinatorParallelGoal(goal);
    if (spawned > 0) {
        return;
    }

    g_agent.ConfigureSession(0, -1, false, g_targetWindow, g_targetProcessName, 512);
    g_agent.Start(goal);
}

void StopGoal() {
    if (g_agent.isRunning) g_agent.Stop();
    StopAllSubAgents();
}

Status GetStatus() {
    Status s;
    int workerCount = CountRunningSubAgents();
    std::lock_guard<std::mutex> lock(g_agentMutex);
    s.running = g_agent.isRunning || workerCount > 0;
    s.paused = g_agent.isPaused;
    s.goal = g_agent.currentGoal;
    s.statusMessage = g_agent.statusMessage;
    s.statusMessage += " | Sub-agents running: " + std::to_string(workerCount);
    s.targetProcess = g_agent.targetProcessName;
    return s;
}

void RenderPage(const ImVec4& accentColor) {
    CleanupFinishedSubAgents();
    RenderProcessSelector(accentColor);

    ImGui::TextColored(accentColor, "AUTONOMOUS AGENT");
    ImGui::SameLine();
    ImGui::TextDisabled("(Beta) | Workers: %d", CountRunningSubAgents());

    ImGui::SameLine(ImGui::GetContentRegionAvail().x - 120);
    if (ImGui::Button(g_targetWindow ? "Change App" : "Attach App")) {
        RefreshProcessList();
        g_showProcessSelector = true;
    }

    if (g_targetWindow) {
        ImGui::TextColored(ImVec4(0.4f, 1.0f, 0.4f, 1.0f), "Target: %s", g_targetProcessName.c_str());
    }
    else {
        ImGui::TextColored(ImVec4(1.0f, 0.4f, 0.4f, 1.0f), "Target: None");
    }
    int workerCount = CountRunningSubAgents();
    if (workerCount > 0) {
        ImGui::TextDisabled("Parallel workers active: %d", workerCount);
    }

    ImGui::Spacing();
    if (!g_providers.empty()) {
        if (g_currProviderIdx >= (int)g_providers.size()) g_currProviderIdx = 0;
        ImGui::PushItemWidth(160.0f);
        const char* currentProvName = g_providers[g_currProviderIdx].name.c_str();
        if (ImGui::BeginCombo("##prov_sel_ag", currentProvName)) {
            for (int n = 0; n < (int)g_providers.size(); n++) {
                bool isSelected = (g_currProviderIdx == n);
                if (ImGui::Selectable(g_providers[n].name.c_str(), isSelected)) {
                    g_currProviderIdx = n;
                    g_currModelIdx = 0;
                    if (g_providers[n].type == AIProvider::Ollama && !g_providers[n].modelsFetched) {
                        Api::FetchModelsForProvider(AIProvider::Ollama);
                    }
                }
                if (isSelected) ImGui::SetItemDefaultFocus();
            }
            ImGui::EndCombo();
        }
        ImGui::SameLine();

        auto& currentProv = g_providers[g_currProviderIdx];
        std::string currentModelName = "Loading...";
        if (!currentProv.models.empty()) {
            if (g_currModelIdx >= (int)currentProv.models.size()) g_currModelIdx = 0;
            currentModelName = currentProv.models[g_currModelIdx].displayName;
        }
        else {
            currentModelName = currentProv.modelsFetched ? "No Models" : "Fetching...";
        }

        ImGui::PushItemWidth(ImGui::GetContentRegionAvail().x);
        if (ImGui::BeginCombo("##mod_sel_ag", currentModelName.c_str())) {
            for (int n = 0; n < (int)currentProv.models.size(); n++) {
                bool isSelected = (g_currModelIdx == n);
                if (ImGui::Selectable(currentProv.models[n].displayName.c_str(), isSelected)) {
                    g_currModelIdx = n;
                }
                if (isSelected) ImGui::SetItemDefaultFocus();
            }
            ImGui::EndCombo();
        }
        ImGui::PopItemWidth();
        ImGui::PopItemWidth();
    }
    else {
        ImGui::TextDisabled("No providers configured.");
    }

    ImGui::Separator();

    float footerHeight = 130.0f;
    ImGui::BeginChild("AgentLog", ImVec2(0.0f, ImGui::GetContentRegionAvail().y - footerHeight), false, ImGuiWindowFlags_AlwaysVerticalScrollbar);

    std::vector<AgentStepLog> logSnapshot;
    std::string statusSnapshot;
    bool runningSnapshot = false;
    bool pausedSnapshot = false;
    int workerSnapshot = CountRunningSubAgents();
    {
        std::lock_guard<std::mutex> lock(g_agentMutex);
        logSnapshot = g_agent.executionLog;
        statusSnapshot = g_agent.statusMessage;
        runningSnapshot = g_agent.isRunning || workerSnapshot > 0;
        pausedSnapshot = g_agent.isPaused;
    }
    if (workerSnapshot > 0) {
        statusSnapshot += " | Workers: " + std::to_string(workerSnapshot);
    }

    if (logSnapshot.empty() && !runningSnapshot) {
        ImGui::Spacing();
        ImGui::TextDisabled("No agent activity yet.");
        ImGui::TextDisabled("Attach a target app, type a goal, and press Start.");
        if (!statusSnapshot.empty() && statusSnapshot != "Idle") {
            ImGui::Spacing();
            ImGui::TextColored(ImVec4(1, 1, 0, 1), "Status: %s", statusSnapshot.c_str());
        }
    }
    else {
        for (const auto& step : logSnapshot) {
            ImGui::Separator();
            ImGui::Text("Step %d", step.step);
            if (!step.goal.empty()) ImGui::TextWrapped("Goal: %s", step.goal.c_str());
            if (!step.reasoning.empty()) ImGui::TextWrapped("Reasoning: %s", step.reasoning.c_str());
            if (!step.error.empty()) ImGui::TextWrapped("Error: %s", step.error.c_str());
            ImGui::TextColored(step.success ? ImVec4(0.4f, 1.0f, 0.4f, 1.0f) : ImVec4(1.0f, 0.4f, 0.4f, 1.0f),
                step.success ? "Success" : "Failed");
        }
        if (runningSnapshot) {
            ImGui::Separator();
            ImGui::TextColored(ImVec4(0.9f, 0.9f, 0.5f, 1.0f), "Status: %s", statusSnapshot.c_str());
        }
    }

    ImGui::EndChild();

    ImGui::Spacing();
    bool sendClicked = false;
    float inputAreaHeight = CalculateInputBoxHeight(g_chatBuffer, ImGui::GetContentRegionAvail().x);
    FloatingInputGhost("agent_goal", "Enter goal...", g_chatBuffer, FocusState::Chat, true, sendClicked, inputAreaHeight);

    bool startClicked = sendClicked;
    if (!runningSnapshot) {
        if (ImGui::Button("Start", ImVec2(120, 0))) startClicked = true;
    }
    else {
        if (ImGui::Button("Stop", ImVec2(120, 0))) {
            g_agent.Stop();
            StopAllSubAgents();
        }
        if (g_agent.isRunning) {
            ImGui::SameLine();
            if (pausedSnapshot) {
                if (ImGui::Button("Resume", ImVec2(120, 0))) g_agent.Resume();
            }
            else {
                if (ImGui::Button("Pause", ImVec2(120, 0))) g_agent.Pause();
            }
        }
    }

    if (startClicked && !runningSnapshot) {
        std::string goal = g_chatBuffer;
        if (!goal.empty()) {
            StartGoal(goal);
            g_chatBuffer.clear();
            g_currentFocus = FocusState::None;
        }
    }
}

} // namespace Agent
