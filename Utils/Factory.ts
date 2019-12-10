class GenericFactory {
    create<T>(type: (new () => T)): T {
        return new type();
    }
}

export const Factory = new GenericFactory();