import {Form, Input} from 'antd'
import ReactDOM from 'react-dom'
import React from 'react'

const FormItem = Form.Item

const Reports = (props) => {

  const { getFieldProps } = props.form;

  const emailProps = getFieldProps('email', {
    validateFirst: true,
    validate: [{
      rules: [
        {required: true, message: '必须填写邮箱地址'},
      ],
      trigger: 'onBlur',
    }, {
      rules: [
        {type: 'email', message: '请输入正确的邮箱地址'},
      ],
      trigger: ['onBlur', 'onChange'],
    }]
  });

  return (
    <Form horizontal form={props.form}>
      <FormItem label="邮箱：">
        <Input {...emailProps} placeholder="请输入邮箱"/>
      </FormItem>
    </Form>
  )
}

const Demo = Form.create()(Reports)

export default Demo