export enum Access {
    Editor = 2,
    Viewer = 1,
    None = 0
}
export const accessOptions = Object.keys(Access)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
        label: key,
        value: Access[key as keyof typeof Access]
    }));