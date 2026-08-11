#pragma once

#include <string>

enum class FocusState { None, Username, Password, Chat, BrowserUrl, BrowserPage, BrowserType };

extern FocusState g_currentFocus;
extern std::string g_chatBuffer;
