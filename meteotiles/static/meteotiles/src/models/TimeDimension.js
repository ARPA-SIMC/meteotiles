class TimeDimension {
    #currentTime = null;
    #availableTimes = []
    #loopOn = false;
    #playing = false;
    #onCurrentTimeChangedCallbacks = [];
    #onAvailableTimesChanged = [];
    #onLoopChangedCallbacks = [];

    getCurrentTime() {
        return this.#currentTime;
    }

    setCurrentTime(currentTime) {
        if (currentTime == this.#currentTime) {
            return;
        }
        if (currentTime != null && this.getAvailableTimes().indexOf(currentTime) == -1) {
            return;
        }
        this.#currentTime = currentTime;
        // notify that current time changed
        this.#notifyCurrentTimeChanged();
    }

    isLoopOn() {
        return this.#loopOn;
    }

    setLoopOn(loopOn) {
        const isLoopOn = loopOn ? true : false;
        if (this.#loopOn != isLoopOn) {
            this.#loopOn = isLoopOn;
            this.#notifyOnLoopChanged();
        }
    }

    getAvailableTimes() {
        return this.#availableTimes;
    }

    setAvailableTimes(availableTimes) {
        const newAvailableTimes = [...new Set(availableTimes)].sort((a, b) => a - b);
        // notify that available times changed
        if (JSON.stringify(newAvailableTimes) == JSON.stringify(this.getAvailableTimes())) {
            return;
        }
        this.#availableTimes = newAvailableTimes;
        // change current time if needed
        if (availableTimes.length == 0) {
            this.setCurrentTime(null);
        } else if (this.#currentTime == null) {
            this.setCurrentTime(this.#availableTimes[0]);
        } else if (this.#availableTimes.indexOf(this.#currentTime) == -1) {
            this.setCurrentTime(availableTimes[0]);
        }
        this.#notifyAvailableTimesChanged(this.getAvailableTimes());
    }

    nextTime() {
        if (this.#availableTimes.length == 0) {
            return;
        }
        const currentTimeIndex = this.#availableTimes.indexOf(this.#currentTime);
        if (currentTimeIndex == -1) {
            this.setCurrentTime(this.#availableTimes[0]);
        } else {
            if (currentTimeIndex == (this.#availableTimes.length - 1)) {
                if (this.#loopOn) {
                    this.setCurrentTime(this.#availableTimes[0]);
                }
            } else {
                this.setCurrentTime(this.#availableTimes[currentTimeIndex + 1]);
            }
        }
    }

    previousTime() {
        if (this.#availableTimes.length == 0) {
            return;
        }
        const currentTimeIndex = this.#availableTimes.indexOf(this.#currentTime);
        if (currentTimeIndex == -1) {
            this.setCurrentTime(this.#availableTimes[0]);
        } else {
            if (currentTimeIndex == 0) {
                if (this.#loopOn) {
                    this.setCurrentTime(this.#availableTimes[this.#availableTimes.length - 1]);
                }
            } else {
                this.setCurrentTime(this.#availableTimes[currentTimeIndex - 1]);
            }
        }
    }

    registerOnCurrentTimeChanged(callback) {
        this.#onCurrentTimeChangedCallbacks.push(callback);
    }

    #notifyCurrentTimeChanged() {
        this.#onCurrentTimeChangedCallbacks.forEach(callback => callback(this.#currentTime));
    }

    registerOnAvailableTimesChanged(callback) {
        this.#onAvailableTimesChanged.push(callback);
    }

    #notifyAvailableTimesChanged() {
        this.#onAvailableTimesChanged.forEach(callback => callback(this.#availableTimes));
    }

    registerOnLoopChanged(callback) {
        this.#onLoopChangedCallbacks.push(callback);
    }

    #notifyOnLoopChanged() {
        this.#onLoopChangedCallbacks.forEach(callback => callback(this.#loopOn));
    }
}

export default TimeDimension;
