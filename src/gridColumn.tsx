import React from 'react';
import './gridColumn.css';
import { ColumnProperties } from './defColTypes';
interface GridColumnProps {
    colProps: ColumnProperties,
    handleColProps: ColumnProperties
};
class GridColumn extends React.Component<GridColumnProps, {}>{

    render() {
        const { colProps, handleColProps } = this.props;
        const colValues = colProps.values, handleValues = handleColProps.values;
        const columnValues = [{ value: colValues.name.value, bestChoice: false, key: colValues.name.value }];
        handleColProps
            .getRowHandles()
            .sort((a, b) => (+handleValues[a].value) - (+handleValues[b].value))
            .forEach(key => columnValues.push({ ...colValues[key], key: colValues.name.value + key }));
        return (
            <div className='GridColumn'>
                {columnValues.map((colProp, index) =>
                    <div key={colProp.key} className={`GridCell${colProp.bestChoice ? ' bestChoice' : ''}`}>
                        {colProp.value}
                    </div>)
                }
            </div >
        );
    }
}
interface HandleGridColumnProps {
    handleColProps: ColumnProperties
};
class HandleGridColumn extends React.Component<HandleGridColumnProps, {}>{

    render() {
        const { handleColProps } = this.props;
        const handleValues = handleColProps.values;
        const columnValues = [{ value: handleValues.name.value, bestChoice: false, key: 'handle' }];
        handleColProps
            .getRowHandles()
            .sort((a, b) => (+handleValues[a].value) - (+handleValues[b].value))
            .forEach(key => columnValues.push({ value: key, bestChoice: false, key: 'handle' + key }))
        return (
            <div className='qoutesGridColumn handleColumn'>
                {columnValues.map((colProp, index) =>
                    <div key={colProp.key} className='GridCell'>
                        {colProp.value}
                    </div>)
                }
            </div >
        );
    }
}
export { GridColumn, HandleGridColumn };