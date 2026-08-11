#pragma once
#include <windows.h>
#include <winternl.h>
#include <string>
#include <cstdint>
#include <utility>

// ============================================================================
// COMPILE-TIME STRING OBFUSCATION (XOR STRING ENCRYPTION)
// ============================================================================
// Encrypts string literals at compile-time so they do NOT appear in the .rdata
// string table analyzed by Ghidra/IDA/AI MCP tools.
// Usage: OBF("my_secret_string") or OBF_W(L"my_secret_wstring")

namespace Obf {
    constexpr uint64_t Seed() {
        uint64_t seed = 0xCBF29CE484222325ULL;
        for (char c : __TIME__) seed = (seed ^ c) * 0x100000001B3ULL;
        for (char c : __FILE__) seed = (seed ^ c) * 0x100000001B3ULL;
        return seed ^ (__LINE__ * 0x37373737ULL);
    }

    template <size_t N, uint64_t K>
    class XorString {
    private:
        char _storage[N];

        constexpr char EncryptChar(char c, size_t i) const {
            return c ^ static_cast<char>((K >> ((i % 8) * 8)) & 0xFF) ^ static_cast<char>((i * 0x5A) & 0xFF);
        }

        char DecryptChar(char c, size_t i) const {
            return c ^ static_cast<char>((K >> ((i % 8) * 8)) & 0xFF) ^ static_cast<char>((i * 0x5A) & 0xFF);
        }

    public:
        template <size_t... Is>
        constexpr XorString(const char(&str)[N], std::index_sequence<Is...>)
            : _storage{ EncryptChar(str[Is], Is)... } {}

        std::string decrypt() const {
            std::string result(N - 1, '\0');
            for (size_t i = 0; i < N - 1; ++i) {
                result[i] = DecryptChar(_storage[i], i);
            }
            return result;
        }

        const char* get(char* buf) const {
            for (size_t i = 0; i < N; ++i) {
                buf[i] = DecryptChar(_storage[i], i);
            }
            return buf;
        }
    };

    template <size_t N, uint64_t K>
    class XorWString {
    private:
        wchar_t _storage[N];

        constexpr wchar_t EncryptChar(wchar_t c, size_t i) const {
            return c ^ static_cast<wchar_t>((K >> ((i % 4) * 16)) & 0xFFFF) ^ static_cast<wchar_t>((i * 0x3B2C) & 0xFFFF);
        }

        wchar_t DecryptChar(wchar_t c, size_t i) const {
            return c ^ static_cast<wchar_t>((K >> ((i % 4) * 16)) & 0xFFFF) ^ static_cast<wchar_t>((i * 0x3B2C) & 0xFFFF);
        }

    public:
        template <size_t... Is>
        constexpr XorWString(const wchar_t(&str)[N], std::index_sequence<Is...>)
            : _storage{ EncryptChar(str[Is], Is)... } {}

        std::wstring decrypt() const {
            std::wstring result(N - 1, L'\0');
            for (size_t i = 0; i < N - 1; ++i) {
                result[i] = DecryptChar(_storage[i], i);
            }
            return result;
        }
    };
}

#define OBF(str) (Obf::XorString<sizeof(str), Obf::Seed() ^ __COUNTER__>(str, std::make_index_sequence<sizeof(str)>()).decrypt())
#define OBF_C(str, buf) (Obf::XorString<sizeof(str), Obf::Seed() ^ __COUNTER__>(str, std::make_index_sequence<sizeof(str)>()).get(buf))
#define OBF_W(str) (Obf::XorWString<sizeof(str)/sizeof(wchar_t), Obf::Seed() ^ __COUNTER__>(str, std::make_index_sequence<sizeof(str)/sizeof(wchar_t)>()).decrypt())

// ============================================================================
// DYNAMIC API HASHING & RESOLUTION
// ============================================================================
// Resolves Win32 API functions by hash at runtime without leaving function
// name strings in the import table or binary.
// Usage: auto fnGetForegroundWindow = RESOLVE_API(L"user32.dll", "GetForegroundWindow", HWND(WINAPI*)(void));

namespace ApiObf {
    constexpr uint32_t HashFn(const char* str) {
        uint32_t hash = 0x811C9DC5;
        while (*str) {
            hash ^= static_cast<uint8_t>(*str++);
            hash *= 0x01000193;
        }
        return hash;
    }

    inline void* GetProcAddressByHash(HMODULE hModule, uint32_t apiHash) {
        if (!hModule) return nullptr;
        auto* pDosHeader = reinterpret_cast<PIMAGE_DOS_HEADER>(hModule);
        if (pDosHeader->e_magic != IMAGE_DOS_SIGNATURE) return nullptr;
        auto* pNtHeaders = reinterpret_cast<PIMAGE_NT_HEADERS>(reinterpret_cast<uint8_t*>(hModule) + pDosHeader->e_lfanew);
        if (pNtHeaders->Signature != IMAGE_NT_SIGNATURE) return nullptr;

        auto exportRva = pNtHeaders->OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_EXPORT].VirtualAddress;
        if (!exportRva) return nullptr;

        auto* pExportDir = reinterpret_cast<PIMAGE_EXPORT_DIRECTORY>(reinterpret_cast<uint8_t*>(hModule) + exportRva);
        auto* pNames = reinterpret_cast<uint32_t*>(reinterpret_cast<uint8_t*>(hModule) + pExportDir->AddressOfNames);
        auto* pFunctions = reinterpret_cast<uint32_t*>(reinterpret_cast<uint8_t*>(hModule) + pExportDir->AddressOfFunctions);
        auto* pOrdinals = reinterpret_cast<uint16_t*>(reinterpret_cast<uint8_t*>(hModule) + pExportDir->AddressOfNameOrdinals);

        for (uint32_t i = 0; i < pExportDir->NumberOfNames; ++i) {
            const char* name = reinterpret_cast<const char*>(reinterpret_cast<uint8_t*>(hModule) + pNames[i]);
            if (HashFn(name) == apiHash) {
                return reinterpret_cast<void*>(reinterpret_cast<uint8_t*>(hModule) + pFunctions[pOrdinals[i]]);
            }
        }
        return nullptr;
    }

    template <typename FuncType>
    inline FuncType Resolve(const wchar_t* dllName, uint32_t apiHash) {
        HMODULE hMod = GetModuleHandleW(dllName);
        if (!hMod) hMod = LoadLibraryW(dllName);
        return reinterpret_cast<FuncType>(GetProcAddressByHash(hMod, apiHash));
    }
}

#define API_HASH(apiName) ApiObf::HashFn(#apiName)
#define RESOLVE_API(dllW, apiName, FuncType) ApiObf::Resolve<FuncType>(dllW, API_HASH(apiName))

// ============================================================================
// STEALTHY ANTI-ANALYSIS / ANTI-DEBUG ENGINE
// ============================================================================
// Lightweight checks against AI/Human dynamic analysis tools (x64dbg, IDA Pro, Ghidra).
// Silently exits execution without error popups if analysis is detected.

namespace AntiDebug {
    inline void HideCurrentThread() {
        typedef NTSTATUS(NTAPI* pfnNtSetInformationThread)(HANDLE, ULONG, PVOID, ULONG);
        auto fnNtSetInfoThread = RESOLVE_API(L"ntdll.dll", NtSetInformationThread, pfnNtSetInformationThread);
        if (fnNtSetInfoThread) {
            fnNtSetInfoThread(GetCurrentThread(), 0x11 /* ThreadHideFromDebugger */, nullptr, 0);
        }
    }

    inline bool CheckAnalysisEnvironment() {
        // 1. Check PEB->BeingDebugged via TEB
        PTEB pTeb = reinterpret_cast<PTEB>(__readgsqword(0x30));
        if (pTeb && pTeb->ProcessEnvironmentBlock) {
            if (pTeb->ProcessEnvironmentBlock->BeingDebugged) return true;
        }

        // 2. Check Win32 API Debugger flag
        if (IsDebuggerPresent()) return true;

        // 3. Check Remote Debugger
        BOOL isRemote = FALSE;
        CheckRemoteDebuggerPresent(GetCurrentProcess(), &isRemote);
        if (isRemote) return true;

        // 4. Check for common Reverse Engineering window classes
        const wchar_t* badClasses[] = { L"OLLYDBG", L"WinDbgFrameClass", L"ID", L"Qt5QWindowIcon" /* x64dbg/IDA */ };
        for (auto cls : badClasses) {
            if (FindWindowW(cls, nullptr)) return true;
        }

        return false;
    }

    inline void GuardExecution() {
        if (CheckAnalysisEnvironment()) {
            // Silently terminate without raising a crash dialog
            ExitProcess(0);
        }
    }
}
