#pragma once

#include <string>
#include <windows.h>

struct ImVec4;

namespace Agent {

struct Status {
    bool running = false;
    bool paused = false;
    std::string goal;
    std::string statusMessage;
    std::string targetProcess;
};

void Init(HWND hwnd);
void Shutdown();

void StartPolling();
void StopPolling();
bool IsPolling();

void SetTelegramToken(const std::string& token);
void SetTelegramChatId(const std::string& chatId);
void SetTelegramEnabled(bool enabled);

const std::string& GetTelegramToken();
const std::string& GetTelegramChatId();
bool IsTelegramEnabled();

bool IsExecuting();

void StartGoal(const std::string& goal);
void StopGoal();

Status GetStatus();

void RenderPage(const ImVec4& accentColor);
}
