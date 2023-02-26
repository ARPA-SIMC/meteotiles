class TimePlayerState {
    isPlaying = false;
    isLoading = false;
    isEnabled = false;
    isPlayForwardEnabled = false;
    isStepForwardEnabled = false;
    isStepBackwardEnabled = false;
}

class TimePlayerController {
    #state;
    #playerTimer;
    #timeDimension;
    #view;
    #loadingPercentage;

    constructor(timeDimension, view) {
        this.#state = new TimePlayerState();
        this.#timeDimension = timeDimension;
        this.#view = view;
    }

    init() {
        this.#view.bindOnStepForwardClicked(() => {
            this.#timeDimension.nextTime();
        });

        this.#view.bindOnStepBackwardClicked(() => {
            this.#timeDimension.previousTime();
        });

        this.#view.bindOnLoopClicked(() => {
            this.#timeDimension.setLoopOn(!this.#timeDimension.isLoopOn());
        });

        this.#view.bindOnSelectTimeIndex((value) => {
            const newCurrentTime = this.#timeDimension.getAvailableTimes()[value];
            this.#timeDimension.setCurrentTime(newCurrentTime);
        });

        this.#view.bindOnPlayClicked(() => {
            if (!this.#state.isPlaying) {
                this.#view.setPlaying();
                this.#startPlayerTimer();
            } else {
                this.#stopPlayerTimer();
            }
            this.#state.isPlaying = !this.#state.isPlaying;
            this.#updateView();
        });

        this.#timeDimension.registerOnAvailableTimesChanged((availableTimes) => {
            this.#updateState();
            this.#updateView();
        });

        this.#timeDimension.registerOnCurrentTimeChanged((currentTime) => {
            this.#updateState();
            this.#updateView();
        });

        this.#timeDimension.registerOnLoopChanged((loopOn) => {
            this.#updateState();
            this.#updateView();
        });

        this.#view.render();
        this.#updateState();
        this.#updateView();
    }

    #startPlayerTimer() {
        this.#stopPlayerTimer();
        this.#playerTimer = setInterval(() => {
            this.#timeDimension.nextTime();
        }, 1000);
    }

    #stopPlayerTimer() {
        clearInterval(this.#playerTimer);
    }

    #updateView() {
        this.#view.renderTime(
            this.#timeDimension.getCurrentTime(),
            this.#timeDimension.getAvailableTimes(),
            this.#state.isEnabled,
            this.#state.isPlaying,
            this.#state.isPlayForwardEnabled,
            this.#state.isStepForwardEnabled,
            this.#state.isStepBackwardEnabled,
            this.#timeDimension.isLoopOn(),
            this.#state.isLoading,
            this.#loadingPercentage,
        );
    }

    #updateState() {
        const availableTimes = this.#timeDimension.getAvailableTimes();
        const currentTimeIndex = availableTimes.indexOf(this.#timeDimension.getCurrentTime());
        const isLoopOn = this.#timeDimension.isLoopOn();
        const isFirstTime = currentTimeIndex == 0;
        const isLastTime = currentTimeIndex == availableTimes.length - 1;

        if (this.#state.isLoading) {
            this.#state.isEnabled = false;
            this.#stopPlayerTimer();
        } else if (availableTimes.length > 0 || currentTimeIndex != -1) {
            this.#state.isEnabled = true;
            if (isLoopOn) {
                this.#state.isPlayForwardEnabled = true;
                this.#state.isStepForwardEnabled = true;
                this.#state.isStepBackwardEnabled = true;
            } else {
                this.#state.isStepBackwardEnabled = !isFirstTime;
                this.#state.isStepForwardEnabled = !isLastTime;
                this.#state.isPlayForwardEnabled = !isLastTime;
                if (isLastTime) {
                    this.#state.isPlaying = false;
                    this.#stopPlayerTimer();
                }
            }
        } else {
            this.#state.isEnabled = false;
            this.#state.isStepForwardEnabled = false;
            this.#state.isStepBackwardEnabled = false;
            this.#state.isPlayForwardEnabled = false;
            this.#state.isPlaying = false;
            this.#stopPlayerTimer();
        }
    }

    setLoading(percentage) {
        this.#state.isLoading = true;
        this.#loadingPercentage = percentage;
        this.#updateState();
        this.#updateView();
    }

    setLoaded() {
        this.#state.isLoading = false;
        if (this.#state.isPlaying) {
            this.#startPlayerTimer();
        }
        this.#updateState();
        this.#updateView();
    }
}

export default TimePlayerController;
