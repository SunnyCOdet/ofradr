# OfraDR

The Ultimate anti-proctoring software built with C++, Dear ImGui, DirectX 11, and WebView2.

It works with every proctoring system out there undetected.
Here is a list in which it works:
Here’s the combined list of everything from both previous messages, with “bypass” after each name (duplicates removed for cleanliness):

ProctorU bypass  
Honorlock bypass  
Proctorio bypass  
Respondus Monitor bypass  
Respondus LockDown Browser bypass  
Proctortrack bypass  
ProctorExam bypass  
Talview bypass  
Mercer Mettl bypass  
Inspera Proctoring bypass  
SMOWL bypass  
Pearson VUE OnVUE bypass  
Prometric ProProctor bypass  
PSI Bridge bypass  
Kryterion Webassessor bypass  
Questionmark bypass  
Proctor360 bypass  
Examus bypass  
MonitorExam bypass  
HirePro bypass  
Wheebox bypass  
Constructor Proctor bypass  
Briso Proctor bypass  
TrustExam.ai bypass  
uLearn.io bypass  
ExamOnline bypass  
Exam.net bypass  
Digiexam bypass  
Synap bypass  
TestInvite bypass  
Quilgo bypass  
ExamSoft bypass  
Examplify bypass  
Meazure Learning bypass  
Guardian Browser bypass  
Aiproctor bypass  
DigiProctor bypass  
Disamina bypass  
Datamatics Proctoring bypass  
RPNow bypass  
Safe Exam Browser bypass  
ExamMonitor bypass  
Eduswitch bypass  
ConductExam bypass  
SpeedExam bypass  
Think Exam bypass  
Eklavvya bypass  
ProctorEdu bypass  
TestWe bypass  
Rosalyn bypass  
ProctorFree bypass  
ProctorCam bypass  
Remote Proctor NOW bypass  
AutoProctor bypass  
ThinkProxi bypass  
ProctorLive AI bypass  
ExamRoom.AI bypass  
Proctoring.com bypass  
Proctorizer bypass  
Integrity Advocate bypass  
Invigilator bypass  
TestReach bypass  
Cirrus Assessment bypass  
Surpass bypass  
Janison Remote Proctoring bypass  
Speedwell bypass  
Gauge Online bypass  
Learnosity Proctoring bypass  
ClassMarker bypass  
HackerEarth Assessments bypass  
HackerRank bypass  
Codility bypass  
iMocha bypass  
CodeSignal bypass  
SHL bypass  
TestGorilla bypass  
Glider AI bypass  
Interview Mocha bypass  
Evalground bypass  
Xobin bypass  
Adaface bypass  
WeCP bypass  
HackerRank Proctor Mode bypass  
CodeTantra bypass  
MeritTrac bypass  
TCS iON Remote Assessments bypass  
NTA Secure Browser bypass  
Wheebox Remote Proctoring bypass  
Mettl Secure Browser bypass  
HirePro Remote Proctoring bypass  
Mercer Mettl SuperProctor bypass  
Talview Proview bypass  
Talview Alvy bypass  
Rosalyn AI Proctoring bypass  
Unstop bypass  
HackerEarth bypass  
CoderPad bypass  
Qualified bypass  
DevSkiller bypass  
TestDome bypass  
eSkill bypass  
Vervoe bypass  
HireVue bypass  
Harver bypass  
Pymetrics bypass  
Criteria bypass  
HackerTrail bypass  
CodeSubmit bypass  
Byteboard bypass  
Triplebyte bypass  
Interviewing.io bypass  
Karat bypass  
CodeInterview bypass  
Coderbyte bypass  
Geektastic bypass  
Mimir bypass  
Sphere Engine bypass  
CodeGrade bypass  
TCS iON bypass  
Superset bypass  
Mercer | Mettl bypass  
HackerRank for Work bypass  
Unstop Assessments bypass  
CodeChef for Business bypass  
InterviewBit bypass  
Skillenza bypass  
FacePrep bypass  
DoSelect bypass  
FirstNaukri Assessments bypass  
CoCubes bypass  
AMCAT bypass  
Aspiring Minds bypass  
Mettl bypass  
MyAnatomy bypass

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
