import React from 'react';
interface GridColumnProps {
    colProps: Record<string, { value: string, bestChoice: boolean }>,
    handleColProps: Record<string, { value: string, bestChoice: boolean }>
};
class GridColumn extends React.Component<GridColumnProps, {}>{

    render() {
     
        const { colProps, handleColProps } = this.props;
        console.log(colProps);
        const columnValues = [{ value: colProps.name.value, bestChoice: false }];
        Object
            .keys(handleColProps)
            .filter(value => value !== 'name')
            .sort((a, b) => (+handleColProps[a].value) - (+handleColProps[b].value))
            .forEach(key => columnValues.push({ ...colProps[key] }));
        return (
            <div className='GridColumn'>
                {columnValues.map((colProp, index) =>
                    <div className={`qoutesGridCell${colProp.bestChoice ? ' bestChoice' : ''}`}>
                        ${colProp.value}
                    </div>)
                }
            </div >
        );
    }
}
interface HandleGridColumnProps {
    handleColProps: Record<string, { value: string, bestChoice: boolean }>
};
class HandleGridColumn extends React.Component<HandleGridColumnProps, {}>{

    render() {
        const { handleColProps } = this.props;
        const columnValues = [{ value: handleColProps.name.value, bestChoice: false }];
        Object
            .keys(handleColProps)
            .filter(value => value !== 'name')
            .sort((a, b) => (+handleColProps[a].value) - (+handleColProps[b].value))
            .forEach(key => columnValues.push({ value: key, bestChoice: false }))
        return (
            <div className='qoutesGridColumn handleColumn'>
                {columnValues.map((colProp, index) =>
                    <div className='qoutesGridCell'>
                        ${colProp.value}
                    </div>)
                }
            </div >
        );
    }
}
export default GridColumn;