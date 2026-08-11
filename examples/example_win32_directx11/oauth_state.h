#pragma once

#include <string>

struct OAuthState {
    std::string access;
    std::string refresh;
    long long expires = 0;
    std::string accountId;
};

void LockOauth();
void UnlockOauth();
OAuthState GetOAuthCopy();
bool IsOAuthValid();

extern bool g_oauthUse;
