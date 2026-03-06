import * as vscode from "vscode";
import * as fs from "fs";

export class AudioPlayerViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "faaaah.audioPlayerView";
  private _view?: vscode.WebviewView;

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    // The HTML contains a simple script that listens for messages and plays audio via the browser
    webviewView.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
      <body>
          <script>
              window.addEventListener('message', event => {
                  const message = event.data;
                  if (message.command === 'play') {
                      const audio = new Audio(message.audioUri);
                      audio.volume = message.volume;
                      audio.play().catch(err => console.error('FAAAAH Playback Error:', err));
                  }
              });
          </script>
      </body>
      </html>
    `;
  }

  public playSound(soundFilePath: string, volume: number) {
    if (!this._view) {
      vscode.window.showWarningMessage(
        "FAAAAH on Fail: Please open the Testing sidebar once to initialize the audio player for remote environments.",
      );
      return;
    }

    try {
      // Read the audio file and convert it to a Base64 URI so the browser can play it
      const audioBuffer = fs.readFileSync(soundFilePath);
      const base64Audio = audioBuffer.toString("base64");
      const audioUri = `data:audio/wav;base64,${base64Audio}`;

      this._view.webview.postMessage({
        command: "play",
        audioUri: audioUri,
        volume: volume,
      });
    } catch (error) {
      console.error("[FAAAAH] Failed to read sound file:", error);
    }
  }
}
