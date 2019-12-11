export class Pair<T1, T2> {
    private key: T1;
    private value: T2;

    constructor(key: T1, value: T2) {
        this.key = key;
        this.value = value;
    }

    static kv<K,V>(k:K,v:V) {
        return new Pair(k,v);
    }

    getKey() {
        return this.key;
    }

    getValue() {
        return this.value;
    }
}