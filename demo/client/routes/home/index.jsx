import React from 'react'

import './index.scss'
import Table from 'fit-table'
import Cropper from 'fit-cropper'
import Backbone from 'backbone'

import image from './a.jpg'

import { Button } from 'antd';

console.log(Backbone)
export default class Home extends React.Component {
    render() {
        return (
            <div>
                React run wellwdwdw!dwwdwd
                <div className="helloworld">Helloworld</div>
                <img src={image} />
              <Button>123</Button>
              <Table></Table>
              <Cropper></Cropper>
            </div>
        )
    }
}
