#pragma once

#include <string>
#include <vector>
#include "obfuscation.h"

enum class AIProvider { Gemini, OpenAI, OpenAIUser, Anthropic, DeepSeek, Moonshot, OpenRouter, Ollama };

struct ModelInfo {
    std::string id;
    std::string displayName;
};

struct ProviderDef {
    std::string name;
    AIProvider type;
    std::vector<ModelInfo> models;
    bool modelsFetched = false;
};

struct UserKeys {
    std::string gemini;
    std::string openai;
    std::string claude;
    std::string kimi;
    std::string openrouter;
    std::string deepseek;
};
