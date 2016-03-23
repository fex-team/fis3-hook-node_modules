import React from 'react'

import './index.scss'
import Table from 'fit-table'
import Cropper from 'fit-cropper'
import Backbone from 'backbone'

import image from './a.jpg'

import { Menu, Dropdown } from 'antd';

const DropdownButton = Dropdown.Button;

function handleButtonClick() {
  console.log('click button');
}

function handleMenuClick(e) {
  console.log('click', e);
}

const menu = (
  <Menu onClick={handleMenuClick}>
    <Menu.Item key="1">第一个菜单项</Menu.Item>
    <Menu.Item key="2">第二个菜单项</Menu.Item>
    <Menu.Item key="3">第三个菜单项</Menu.Item>
  </Menu>
);

export default class Home extends React.Component {
    render() {
        return (
            <div>
                React run wellwdwdw!dwwdwd
                <div className="helloworld">Helloworld</div>
                <img src={image} />
                <div className="dropdown">
                    <DropdownButton onClick={handleButtonClick} overlay={menu} type="primary">
                    某功能按钮
                    </DropdownButton>
                </div>
                <Table></Table>
                <Cropper></Cropper>
            </div>
        )
    }
}
