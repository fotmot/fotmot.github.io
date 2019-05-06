class Source {

    constructor() {
        this.settings_key = 'settings_' + this.__proto__.constructor.name;
        let storedSettings = localStorage[this.settings_key];
        if (storedSettings == undefined) {
            storedSettings = JSON.stringify(this.getDefaultSettings());
            localStorage[this.settings_key] = storedSettings;
        }
        this.settings = JSON.parse(storedSettings);
    }

    static getRndInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getSource(current_method) {
        switch (parseInt(current_method)) {
            case 1:
                return new PixelsSourceImpl();
            case 2:
                return new YandexSourceImpl();
        }
    }

    show() {

    }

    getDefaultSettings() {
        return {};
    }

    settingsSetValue(key, value) {
        this.settings[key] = value;
        localStorage[this.settings_key] = JSON.stringify(this.settings);
    }

    settingsGetValue(key) {
        return this.settings[key];
    }

    getCustomPreferences() {
        return {};
    }
}