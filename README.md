# OfraDR

Windows desktop automation and accessibility software built with C++, Dear ImGui, DirectX 11, and WebView2.

## Requirements

- Windows 10 or later
- Visual Studio 2022 with the **Desktop development with C++** workload
- MSVC v143 toolset
- Windows 10/11 SDK with DirectX 11 development libraries
- WebView2 Runtime
- NuGet, or Visual Studio's NuGet package restore support

The checked-in Visual Studio project is configured for Win32 and x64. x64 is recommended.

## Restore dependencies

From the repository root, restore the native NuGet packages declared in
`examples/example_win32_directx11/packages.config`:

```powershell
nuget restore examples\imgui_examples.sln -PackagesDirectory examples\packages
```

Alternatively, open the solution in Visual Studio and choose **Restore NuGet
Packages** if prompted.

The restore provides nlohmann/json and the Microsoft WebView2 SDK used by the
project.

## Build with Visual Studio

1. Open `examples/imgui_examples.sln`.
2. Select the `example_win32_directx11` project.
3. Select `Release` and `x64`.
4. Choose **Build → Build Solution**.

The Release executable is written to:

```text
examples\example_win32_directx11\Release\hope.exe
```

For a debug build, choose `Debug|x64`; the output is written to
`examples\example_win32_directx11\Debug\example_win32_directx11.exe`.

## Build from a Developer Command Prompt

Run the following from a Visual Studio Developer Command Prompt:

```bat
msbuild examples\imgui_examples.sln /m /p:Configuration=Release /p:Platform=x64
```

## Runtime configuration

The build does not contain service credentials. Features that use the
associated backend can read their values from environment variables:

```powershell
$env:OFRADR_SUPABASE_ANON_KEY = "your-value"
$env:OFRADR_OPENAI_CLIENT_ID = "your-value"
```

Keep these values outside the repository. Local OAuth session data is written
to `oauth.json`, which is ignored by Git.

## Licensing

Original project code is covered by [LICENSE](LICENSE). Third-party components
remain under their upstream licenses; see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
