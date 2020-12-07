//https://codepen.io/amazon-ivs/pen/c3b13a2df34b60ada7756f3a2af8d2f0

// This shows how to include the Amazon IVS Player with a script tag from our CDN
// If self hosting, you may not be able to use the create() method since it requires
// that file names do not change and are all hosted from the same directory.

function sendSurvey() {
    var xhttp = new XMLHttpRequest()
    xhttp.open("POST", "http://localhost:3000/channels/metadata", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    // TODO: add your channel ARN.
    xhttp.send(JSON.stringify({
        channelArn: ""
    }));
}

function showSurvey(surveyJson) {
    Survey.StylesManager.applyTheme("bootstrap");
    const survey = new Survey.Model(surveyJson);
    $("#surveyElement").SurveyWindow({
        model:survey,
        onComplete: () => {
            alert('Survey submitted!!');
        }
    });
}

(function (IVSPlayerPackage) {

  // First, check if the browser supports the IVS player.
  if (!IVSPlayerPackage.isPlayerSupported) {
      console.warn("The current browser does not support the IVS player.");
      return;
  }

  const PlayerState = IVSPlayerPackage.PlayerState;
  const PlayerEventType = IVSPlayerPackage.PlayerEventType;

  // Initialize player
  const player = IVSPlayerPackage.create();
  console.log("IVS Player version:", player.getVersion());
  player.attachHTMLVideoElement(document.getElementById("video-player"));

  // Attach event listeners
  player.addEventListener(PlayerState.PLAYING, function () {
      console.log("Player State - PLAYING");
  });
  player.addEventListener(PlayerState.ENDED, function () {
      console.log("Player State - ENDED");
  });
  player.addEventListener(PlayerState.READY, function () {
      console.log("Player State - READY");
  });
  player.addEventListener(PlayerEventType.ERROR, function (err) {
      console.warn("Player Event - ERROR:", err);
  });
  player.addEventListener(PlayerEventType.TEXT_METADATA_CUE, (cue) => {
      const metadataText = cue.text;
      showSurvey(JSON.parse(cue.text));
      const position = player.getPosition().toFixed(2);
      console.log(
          `PlayerEvent - TEXT_METADATA_CUE: "${metadataText}". Observed ${position}s after playback started.`
      );
  });

  // Setup stream and play
  player.setAutoplay(true);
  // TODO: add your playback URL.
  player.load(
      ""
  );
  player.setVolume(0.5);
})(window.IVSPlayer);
