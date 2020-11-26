import React from 'react';
import ProField, { ProFieldEmptyText, ProFieldValueType } from '@ant-design/pro-field';
import { ProSchemaComponentTypes } from '@ant-design/pro-utils';
import { ProColumnType } from './index';
import InlineErrorFormItem from './component/InlineErrorFormItem';

const SHOW_EMPTY_TEXT_LIST = ['', null, undefined];

/**
 * 拼接用于编辑的 key
 * @param base 基本的 key
 * @param dataIndex 需要拼接的key
 */
export const spellNamePath = (
  base: React.Key,
  dataIndex: React.Key | React.Key[],
): React.Key[] | React.Key | undefined => {
  if (Array.isArray(dataIndex)) {
    return [base, ...dataIndex];
  }
  return [base, dataIndex];
};

/**
 * 根据不同的类型来转化数值
 * @param text
 * @param valueType
 */
function defaultRenderText<T>(config: {
  text: string | number | React.ReactText[];
  valueType: ProColumnType['valueType'];
  index: number;
  rowData?: T;
  columnEmptyText?: ProFieldEmptyText;
  columnProps?: ProColumnType<T>;
  type?: ProSchemaComponentTypes;
  // 行的唯一 key
  rowKey?: React.Key;
  mode: 'edit' | 'read';
}): React.ReactNode {
  const { text, valueType, rowData, columnProps } = config;
  // 如果 valueType === text ，没必要多走一次 render
  if (
    (!valueType || valueType === 'text') &&
    // valueEnum 存在说明是个select
    !columnProps?.valueEnum &&
    config.mode === 'read'
  ) {
    // 如果是''、null、undefined 显示columnEmptyText
    return SHOW_EMPTY_TEXT_LIST.includes(text as any) ? config.columnEmptyText : text;
  }

  if (typeof valueType === 'function' && rowData) {
    // 防止valueType是函数,并且text是''、null、undefined跳过显式设置的columnEmptyText
    return defaultRenderText({
      ...config,
      valueType: valueType(rowData, config.type) || 'text',
    });
  }

  const dom = (
    <ProField
      {...columnProps?.fieldProps}
      valueEnum={columnProps?.valueEnum}
      request={columnProps?.request}
      params={columnProps?.params}
      proFieldKey={columnProps?.dataIndex?.toString() || columnProps?.key}
      text={valueType === 'index' || valueType === 'indexBorder' ? config.index : text}
      mode={config.mode}
      emptyText={config.columnEmptyText}
      render={undefined}
      renderFormItem={undefined}
      valueType={valueType as ProFieldValueType}
    />
  );

  // 如果是编辑模式，需要用 Form.Item 包一下
  if (config.mode === 'edit') {
    return (
      <InlineErrorFormItem
        initialValue={text}
        name={spellNamePath(
          config.rowKey || config.index,
          columnProps?.key || columnProps?.dataIndex || config.index,
        )}
        {...columnProps?.formItemProps}
      >
        {dom}
      </InlineErrorFormItem>
    );
  }
  return dom;
}

export default defaultRenderText;
