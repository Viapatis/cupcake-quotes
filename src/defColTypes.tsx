class ValueColumnProperties {
    value: string = '';
    bestChoice: boolean = false;
    constructor();
    constructor(value: string);
    constructor(value: string, bestChoice: boolean);
    constructor(value?: string, bestChoice?: boolean) {
        if (typeof value !== 'undefined') {
            this.value = value;
            if (typeof bestChoice !== 'undefined')
                this.bestChoice = bestChoice;
        }
    }
}
class ColumnProperties {
    values: Record<string, ValueColumnProperties> = { name: new ValueColumnProperties('title') };
    index: number = 0;
    nameRow: boolean = true;
    constructor();
    constructor(values: Record<string, ValueColumnProperties>, index: number);
    constructor(rowCount: number, name: string);
    constructor(rowCount: number, index: number);
    constructor(rowCount: number, index: number, name: string);
    constructor(rowCountOrValues?: any, indexOrName?: any, name?: string) {
        if (typeof rowCountOrValues !== 'number') {
            this.index = indexOrName!;
            this.values = { ...rowCountOrValues };
        } else {
            if (typeof indexOrName === 'number') {
                this.index = indexOrName;
                for (let i = 0; i < rowCountOrValues; i++) {
                    this.values[i + ''] = new ValueColumnProperties(i + '' + indexOrName);
                }
            }
            for (let i = 0; i < rowCountOrValues; i++) {
                this.values[i + ''] = new ValueColumnProperties();
            }
            if (typeof name === 'string') {
                this.values.name = new ValueColumnProperties(name);
            } else if (typeof indexOrName === 'string') {
                this.values.name = new ValueColumnProperties(indexOrName);
            }
        }
    };
    getRowHandles = (exclude: string = 'name') => {
        return Object.keys(this.values).filter(handle => handle !== exclude)
    }
    getName = () => {
        return this.values.name.value;
    }
}
export { ValueColumnProperties, ColumnProperties };