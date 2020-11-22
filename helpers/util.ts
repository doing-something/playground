export const identity = <T>(v: T) => v;
export const isNil = <T>(v: T) => v === undefined || v === null;
export const serializeForm = (formElement: HTMLFormElement) => {
    return Object.fromEntries(new FormData(formElement));

}
