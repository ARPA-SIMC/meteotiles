import { formatDate } from '../utils.js';

class TimePlayerView {
    #root;
    #onStepForwardClicked = () => {};
    #onStepBackwardClicked = () => {};
    #onLoopClicked = () => {};
    #onSelectTimeIndex = (index) => {};
    #onPlayClicked = () => {};

    constructor(element) {
        this.#root = element;
    }

    render() {
        this.#root.querySelector(".play-forward").addEventListener("click", () => {
            this.#onPlayClicked();
        });
        this.#root.querySelector(".step-backward").addEventListener("click", () => {
            this.#onStepBackwardClicked();
        });
        this.#root.querySelector(".step-forward").addEventListener("click", () => {
            this.#onStepForwardClicked();
        });
        this.#root.querySelector(".loop").addEventListener("click", (ev) => {
            this.#onLoopClicked();
        });
        this.#root.querySelector(".time-player-controls").addEventListener("wheel", (event) => {
            const direction = event.deltaY;
            const timerangeElement = this.#root.querySelector(".time-range");
            if (direction < 0) {
                this.#onStepForwardClicked();
            } else {
                this.#onStepBackwardClicked();
            }
        }, {
            passive: true,
        });
        this.#root.querySelector(".time-range").addEventListener("change", (event) => {
            this.#onSelectTimeIndex(this.#root.querySelector(".time-range").value);
        }, false);
    }

    renderTime(currentTime, availableTimes, isEnabled, isPlaying, isPlayForwardEnabled, isStepForwardEnabled, isStepBackwardEnabled, isLoopOn, isLoading, loadingPercentage) {
        const slider = this.#root.querySelector(".time-range");
        if (availableTimes.length == 0) {
            slider.max = "0";
            slider.value = "0";
        } else {
            slider.min = "0";
            slider.max = (availableTimes.length - 1).toString();
            slider.value = availableTimes.indexOf(currentTime).toString();
        }
        if (isEnabled) {
            this.enableControls();
        } else {
            this.disableControls();
        }
        if (isPlaying) {
            this.#root.querySelector(".play-forward").classList.add("playing");
        } else {
            this.#root.querySelector(".play-forward").classList.remove("playing");
        }
        this.#root.querySelector(".play-forward").disabled = !isPlayForwardEnabled;
        this.#root.querySelector(".step-forward").disabled = !isStepForwardEnabled;
        this.#root.querySelector(".step-backward").disabled = !isStepBackwardEnabled;
        let datetimeLabel = formatDate(currentTime);
        this.#root.querySelector(".datetime-label").innerText = datetimeLabel;
        this.setLoop(isLoopOn);
        if (isLoading) {
            this.#root.querySelector(".time-player-controls .loader").classList.add("loading");
        } else {
            this.#root.querySelector(".time-player-controls .loader").classList.remove("loading");
        }
        if (isLoading || availableTimes.length > 0) {
            this.#root.querySelector(".time-player-controls .loader").innerText = `${loadingPercentage}%`;
        } else {
            this.#root.querySelector(".time-player-controls .loader").innerText = "";
        }
    }

    renderLoading() {
        this.disableControls();
        this.#root.querySelector(".time-player-controls .loader").classList.add("loading");
    }

    renderLoaded() {
        this.#root.querySelector(".time-player-controls .loader").classList.remove("loading");
    }

    disableControls() {
        this.#root.querySelectorAll(".time-player-controls-buttons button").forEach((el) => el.disabled = true);
        this.#root.querySelector(".time-player-controls .time-range").disabled = true;
        const playing = this.#root.querySelector(".time-player-controls .play-forward.playing");
        if (playing) {
            playing.disabled = false;
        }
    }

    enableControls() {
        this.#root.querySelectorAll(".time-player-controls-buttons button").forEach((el) => el.disabled = false);
        this.#root.querySelector(".time-player-controls .time-range").disabled = false;
    }

    setLoop(isActive) {
        if (isActive) {
            this.#root.querySelector(".loop").classList.add("active");
        } else {
            this.#root.querySelector(".loop").classList.remove("active");
        }
    }

    setPlaying() {
        this.#root.querySelector(".play-forward").classList.add("playing");
        this.disableControls();
    }

    setPaused() {
        this.#root.querySelector(".play-forward").classList.remove("playing");
        this.enableControls();
    }

    bindOnStepForwardClicked(callback) {
        this.#onStepForwardClicked = callback;
    }

    bindOnStepBackwardClicked(callback) {
        this.#onStepBackwardClicked = callback;
    }

    bindOnLoopClicked(callback) {
        this.#onLoopClicked = callback;
    }

    bindOnSelectTimeIndex(callback) {
        this.#onSelectTimeIndex = callback;
    }

    bindOnPlayClicked(callback) {
        this.#onPlayClicked = callback;
    }

    bindSelectTimeIndex(callback) {
        this.#onSelectTimeIndex = callback;
    }
}

export default TimePlayerView;
