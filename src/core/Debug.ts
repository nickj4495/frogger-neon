export class Debug {
    public static testMode =
        false;

    public static toggleTestMode():
        boolean {
        Debug.testMode =
            !Debug.testMode;

        console.log(
            `TEST MODE: ${
                Debug.testMode
                    ? 'ON'
                    : 'OFF'
            }`
        );

        return Debug.testMode;
    }

    public static isTestMode():
        boolean {
        return Debug.testMode;
    }
}