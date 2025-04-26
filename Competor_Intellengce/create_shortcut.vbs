Set WshShell = CreateObject("WScript.Shell")
desktopPath = WshShell.SpecialFolders("Desktop")
Set shortcut = WshShell.CreateShortcut(desktopPath & "\AI Competitor Intelligence.lnk")
shortcut.TargetPath = "Z:\Agents\Competor_Intellengce\launch_agent.bat"
shortcut.WorkingDirectory = "Z:\Agents\Competor_Intellengce"
shortcut.Description = "AI Competitor Intelligence Agent"
shortcut.IconLocation = "C:\Windows\System32\SHELL32.dll,44"
shortcut.Save