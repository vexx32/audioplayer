/**
 * Constrains a value to a given upper and lower bound.
 *
 * @param number The value to constrain.
 * @param lowerBound The minimum allowed value.
 * @param upperBound The maximum allowed value.
 **/
function constrain(number, lowerBound, upperBound) {
    return Math.max(
        lowerBound,
        Math.min(upperBound, number));
}

class AudioPlayer {

    constructor() {
        "use strict";

        // Private variables
        var _elements = {
            audio: document.getElementById("audio"),
            playerButtons: {
                playBtn: document.querySelector(".main-toggle-btn"),
                nextTrackBtn: document.querySelector(".next-track-btn"),
                previousTrackBtn: document.querySelector(".previous-track-btn"),
                toggleLoopBtn: document.querySelector(".toggle-loop-btn")
            },
            progressBar: document.querySelector(".progress-box"),
            volumeBar: document.querySelector(".volume-box"),
            playlist: null,
            trackInfoBox: document.querySelector(".track-info-box")
        };
        var _currentTrack = null;
        var _trackLoaded = false;
        var _loopTrack = _elements.audio.getAttribute("data-loop-track") === "true";

        var _progressClicked = false;
        var _progressBarIndicator = _elements.progressBar.querySelector(".progress-indicator");
        var _progressBar = _elements.progressBar.querySelector(".progress");
        var _volumeClicked = false;
        var _volumeBar = _elements.volumeBar.querySelector(".volume");
        var _volumeIndicator = _elements.volumeBar.querySelector(".volume-indicator");

        this.getCurrentTrack = function() {
            if (!_trackLoaded) {
                return null;
            }

            return {
                index: _currentTrack,
                title: _elements.playlist[_currentTrack].title
            };
        };

        this.getPlaylist = function() {
            return _elements.playlist;
        }

        var _setVolume = function(volume) {
            var volumeBarWidth = _volumeBar.offsetWidth - _volumeIndicator.offsetWidth;

            _updateVolumeIndicatorPosition(volumeBarWidth * volume);
            _setVolumeLevel(volume);
        };

        /**
         * Set the audio playback volume.
         *
         * @param volume The audio volume, must be between 0 and 1.
         **/
        this.setVolume = _setVolume;

        var _setVolumeLevel = function(volume) {
            _elements.audio.volume = constrain(volume, 0, 1);
        };

        var _updateVolumeIndicatorPosition = function(newPosition) {
            var volumeBarWidth = _volumeBar.offsetWidth - _volumeIndicator.offsetWidth;
            _volumeIndicator.style.left = constrain(newPosition, 0, volumeBarWidth) + "px";
        };

        /**
         * Determines the buffer progress.
         *
         * @param audio The audio element on the page.
         **/
        var _bufferProgress = function(audio) {
            var bufferedTime = 0;
            if (audio.readyState === 4) {
                bufferedTime = (audio.buffered.end(0) * 100) / audio.duration;
            }
            var progressBuffer = _elements.progressBar.querySelector(".progress-buffer");

            progressBuffer.style.width = bufferedTime + "%";
        };

        var _handleProgressIndicatorClick = function(event) {
            var progressBar = document.querySelector(".progress-box");
            return (event.pageX - progressBar.offsetLeft) / progressBar.querySelector('.progress').offsetWidth;
        };

        var _handleVolumeControlClick = function(event) {
            var volumeBar = document.querySelector(".volume-box");
            var volume = (event.pageX - volumeBar.offsetLeft) / volumeBar.querySelector(".volume").offsetWidth;
            _setVolumeLevel(volume);
        };

        /**
         * Populates the playlist element with selectable track names
         *
         * @param audioSources An array of &lt;source&gt; elements from the player's &lt;audio&gt; element.
         * @param listContainer The &lt;ul&gt; or &lt;ol&gt; container element to add &lt;li&gt; playlist elements to.
         **/
        var _createTrackList = function(audioSources, listContainer) {
            for (var i = 0; i < audioSources.length; i++) {
                var track = audioSources[i];
                var listItem = document.createElement("li");
                listItem.classList.add("play-list-row");

                var trackTitle = track.getAttribute("data-track-title");
                var playlistLink = document.createElement("a");
                playlistLink.href = "#";
                playlistLink.textContent = trackTitle;
                playlistLink.classList.add("playlist-track");
                playlistLink.setAttribute("data-track-index", i);

                listItem.append(playlistLink);
                listContainer.append(listItem);

                //Playlist link clicked.
                playlistLink.addEventListener("click", _selectPlaylistTrack, false);
            }

            return listContainer.getElementsByClassName("playlist-track");
        };

        var _selectPlaylistTrack = function(event) {
            event.preventDefault();
            var selectedTrack = parseInt(this.getAttribute("data-track-index"));

            if (selectedTrack !== _currentTrack) {
                _resetPlayStatus();
                _currentTrack = null;
                _trackLoaded = false;
            }

            if (!_trackLoaded) {
                _currentTrack = parseInt(selectedTrack);
                _setTrack();
            } else {
                _playBack(this);
            }
        };

        /**
         * Initializes the html5 audio player and the playlist.
         *
         **/
        var _initPlayer = function() {

            if (_currentTrack === 0 || _currentTrack === null) {
                _elements.playerButtons.previousTrackBtn.disabled = true;
            }

            //Generate playlist entries from the audio elements
            _elements.playlist = _createTrackList(_elements.audio.children, document.querySelector(".play-list .play-list-popout"));

            //Audio time has changed so update it.
            _elements.audio.addEventListener("timeupdate", _trackTimeChanged, false);

            //Audio track has ended playing.
            _elements.audio.addEventListener("ended", function(event) {
                _trackHasEnded();
            }, false);

            //Audio error.
            _elements.audio.addEventListener("error", _handleAudioLoadError, false);

            //Large toggle button clicked.
            _elements.playerButtons.playBtn.addEventListener("click", function(event) {
                if (!_trackLoaded) {
                    _currentTrack = 0;
                    _setTrack();
                } else {
                    _playBack();
                }
            }, false);

            //Next track button clicked.
            _elements.playerButtons.nextTrackBtn.addEventListener("click", function(event) {
                if (this.disabled !== true) {
                    _currentTrack++;
                    _trackLoaded = false;
                    _resetPlayStatus();
                    _setTrack();
                }
            }, false);

            //Previous track button clicked.
            _elements.playerButtons.previousTrackBtn.addEventListener("click", function(event) {
                if (this.disabled !== true) {
                    _currentTrack--;
                    _trackLoaded = false;
                    _resetPlayStatus();
                    _setTrack();
                }
            }, false);

            //Toggle repeat button clicked
            _elements.playerButtons.toggleLoopBtn.addEventListener("click", function(event) {
                _loopTrack = !_loopTrack;
                if (_loopTrack) {
                    this.classList.add('on');
                } else if (this.classList.contains('on')) {
                    this.classList.remove('on');
                }
            }, false);

            //User is moving progress indicator.
            _progressBarIndicator.addEventListener("mousedown", _progressMouseDown, false);
            _progressBar.addEventListener("mousedown", _progressMouseDown, false);

            //User is moving volume indicator.
            _volumeIndicator.addEventListener("mousedown", _volumeMouseDown, false);
            _volumeBar.addEventListener("mousedown", _volumeMouseDown, false);

            //User stops moving progress/volume indicator.
            window.addEventListener("mouseup", _mouseUp, false);

            //Check the audio player's volume attribute and set the slider and volume accordingly.
            var volume = 1;
            if (_elements.audio.hasAttribute("volume")) {
                volume = parseFloat(_elements.audio.getAttribute("volume"));
            }

            _setVolume(volume);
        };

        var _handleAudioLoadError = function(event) {
            switch (event.target.error.code) {
                case event.target.error.MEDIA_ERR_ABORTED:
                    alert('The audio playback was deliberately aborted.');
                    break;
                case event.target.error.MEDIA_ERR_NETWORK:
                    alert('A network error caused the audio download to fail.');
                    break;
                case event.target.error.MEDIA_ERR_DECODE:
                    alert('The audio playback was aborted due to a corruption problem or because it used features your browser did not support.');
                    break;
                case event.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    alert('The audio could not be loaded, either because the server or network failed or because the format is not supported.');
                    break;
                default:
                    alert('An unknown error occurred.');
                    break;
            }
            trackLoaded = false;
            _resetPlayStatus();
        };

        /**
         * Handles the mousedown event on the progress bar by a user and determines if the mouse is being moved.
         *
         * @param e The event object.
         **/
        var _progressMouseDown = function(event) {
            if (_trackLoaded) {
                _moveProgressIndicator(event);
                window.addEventListener("mousemove", _moveProgressIndicator, true);
                _elements.audio.removeEventListener("timeupdate", _trackTimeChanged, false);

                _progressClicked = true;
            }
        };

        var _volumeMouseDown = function(event) {
            _moveVolumeIndicator(event);
            window.addEventListener("mousemove", _moveVolumeIndicator, true);

            _volumeClicked = true;
        };

        /**
         * Handles the mouseup event by a user.
         *
         * @param e The event object.
         **/
        var _mouseUp = function(event) {
            if (_progressClicked) {
                var duration = parseFloat(audio.duration);
                var progressIndicatorClick = parseFloat(_handleProgressIndicatorClick(event));
                window.removeEventListener("mousemove", _moveProgressIndicator, true);

                _elements.audio.currentTime = duration * progressIndicatorClick;
                _elements.audio.addEventListener("timeupdate", _trackTimeChanged, false);
                _progressClicked = false;
            } else if (_volumeClicked) {
                _handleVolumeControlClick(event);
                window.removeEventListener("mousemove", _moveVolumeIndicator, true);

                _volumeClicked = false;
            }
        };

        /**
         * Moves the progress indicator to a new point in the audio.
         *
         * @param event The event object.
         **/
        var _moveProgressIndicator = function(event) {
            var newPosition = 0;
            var progressBarWidth = _elements.progressBar.querySelector(".progress").offsetWidth - _progressBarIndicator.offsetWidth;

            newPosition = event.pageX - _elements.progressBar.offsetLeft;

            if ((newPosition >= 1) && (newPosition <= progressBarWidth)) {
                _progressBarIndicator.style.left = newPosition + ".px";
            } else if (newPosition <= 0) {
                _progressBarIndicator.style.left = "0";
            } else if (newPosition > progressBarWidth) {
                _progressBarIndicator.style.left = progressBarWidth + "px";
            }
        };

        /**
         * Moves the progress indicator to a new point in the audio.
         *
         * @param event The event object.
         **/
        var _moveVolumeIndicator = function(event) {
            var newPosition = 0;

            newPosition = event.pageX - _elements.volumeBar.offsetLeft;
            _updateVolumeIndicatorPosition(newPosition);
            _handleVolumeControlClick(event);
        };

        /**
         * Controls playback of the audio element.
         *
         **/
        var _playBack = function() {
            if (_elements.audio.paused) {
                _elements.audio.play();
                _updatePlayStatus(true);
                document.title = "\u25B6 " + document.title;
            } else {
                _elements.audio.pause();
                _updatePlayStatus(false);
                document.title = document.title.substr(2);
            }
        };

        /**
         * Sets the track if it hasn't already been loaded yet.
         *
         **/
        var _setTrack = function() {
            if (_elements.audio.children.length === 1) {
                _currentTrack = 0;
            }

            var songURL = _elements.audio.children[_currentTrack].src;

            _elements.audio.setAttribute("src", songURL);
            _elements.audio.load();

            _progressBarIndicator.style.left = 0;

            _trackLoaded = true;

            _setTrackTitle(_currentTrack, _elements.playlist);

            _setActiveItem(_currentTrack, _elements.playlist);

            _elements.trackInfoBox.style.visibility = "visible";

            _playBack();
        };

        /**
         * Sets the actively playing item within the playlist.
         *
         * @param currentTrack The current track number being played.
         * @param playlist The playlist object.
         **/
        var _setActiveItem = function(currentTrack, playlist) {
            for (var i = 0; i < playlist.length; i++) {
                var trackTitle = playlist[i];
                if (trackTitle.classList.contains('active-track')) {
                    trackTitle.classList.remove('active-track');
                }
            }

            playlist[currentTrack].classList.add("active-track");
        };

        /**
         * Sets the text for the currently playing song.
         *
         * @param currentTrack The current track number being played.
         * @param playlist The playlist object.
         **/
        var _setTrackTitle = function(currentTrack, playlist) {
            var trackTitleBox = document.querySelector(".player .info-box .track-info-box .track-title-text");
            var trackTitle = playlist[currentTrack].outerText;

            trackTitleBox.innerHTML = null;
            trackTitleBox.innerHTML = trackTitle;

            document.title = trackTitle;
        };

        /**
         * Plays the next track when a track has ended playing.
         *
         **/
        var _trackHasEnded = function() {
            parseInt(_currentTrack);
            if (!_loopTrack) {
                _currentTrack = (_currentTrack === _elements.playlist.length - 1) ? 0 : _currentTrack + 1;
            }
            _trackLoaded = false;

            _resetPlayStatus();

            _setTrack();
        };

        /**
         * Updates the time for the song being played.
         *
         **/
        var _trackTimeChanged = function() {
            var currentTimeBox = document.querySelector(".player .info-box .track-info-box.audio-time .current-time");
            var currentTime = audio.currentTime;
            var duration = audio.duration;
            var durationBox = document.querySelector(".player .info-box .track-info-box.audio-time .duration");
            var trackCurrentTime = _trackTime(currentTime);
            var trackDuration = _trackTime(duration);

            currentTimeBox.innerHTML = null;
            currentTimeBox.innerHTML = trackCurrentTime;

            durationBox.innerHTML = null;
            durationBox.innerHTML = trackDuration;

            _updateProgressIndicator(audio);
            _bufferProgress(audio);
        };

        /**
         * A utility function for converting a time in milliseconds to a readable time of minutes and seconds.
         *
         * @param seconds The time in seconds.
         *
         * @return time The time in minutes and/or seconds.
         **/
        var _trackTime = function(seconds) {
            var min = 0;
            var sec = Math.floor(seconds);
            var time = 0;

            min = Math.floor(sec / 60);
            if (isNaN(min)) {
                min = 0;
            }

            min = min >= 10 ? min : '0' + min;

            sec = Math.floor(sec % 60);
            if (isNaN(sec)) {
                sec = 0;
            }

            sec = sec >= 10 ? sec : '0' + sec;

            time = min + ':' + sec;

            return time;
        };

        /**
         * Updates both the large and small toggle buttons accordingly.
         *
         * @param audioPlaying A boolean value indicating if audio is playing or paused.
         **/
        var _updatePlayStatus = function(audioPlaying) {
            var mainButton = _elements.playerButtons.playBtn;
            if (audioPlaying) {
                mainButton.classList.remove("large-play-btn");
                mainButton.classList.add("large-pause-btn");
            } else {
                mainButton.classList.remove("large-pause-btn");
                mainButton.classList.add("large-play-btn");
            }

            //Update next and previous buttons accordingly
            var prevButton = _elements.playerButtons.previousTrackBtn;
            if (_currentTrack === 0) {
                prevButton.disabled = true;
                prevButton.classList.add("disabled");
            } else if (_currentTrack > 0 && _currentTrack !== _elements.playlist.length) {
                prevButton.disabled = false;
                prevButton.classList.remove("disabled");
            }
        };

        /**
         * Updates the location of the progress indicator according to how much time left in audio.
         *
         **/
        var _updateProgressIndicator = function() {
            var currentTime = parseFloat(_elements.audio.currentTime);
            var duration = parseFloat(_elements.audio.duration);
            var indicatorLocation = 0;
            var progressBarWidth = parseFloat(_elements.progressBar.offsetWidth);
            var progressIndicatorWidth = parseFloat(_progressBarIndicator.offsetWidth);
            var progressBarIndicatorWidth = progressBarWidth - progressIndicatorWidth;

            indicatorLocation = progressBarIndicatorWidth * (currentTime / duration);

            _progressBarIndicator.style.left = Math.trunc(indicatorLocation) + "px";
        };

        /**
         * Resets all toggle buttons to be play buttons.
         *
         **/
        var _resetPlayStatus = function() {
            var button = _elements.playerButtons.playBtn;
            button.classList.remove("large-pause-btn");
            button.classList.add("large-play-btn");
        };

        _initPlayer();
    }
}

var player = new AudioPlayer();