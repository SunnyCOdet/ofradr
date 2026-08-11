#pragma once

#include <string>
#include <vector>

struct ID3D11ShaderResourceView;

struct CapturedImage {
    ID3D11ShaderResourceView* textureView;
    std::string base64Data;
    int width;
    int height;
};

extern std::vector<CapturedImage> g_screenshots;
void CaptureScreenshot();
