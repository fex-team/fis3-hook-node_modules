import React from 'react'

import './index.scss'

import image from './a.jpg'

import { Button } from 'antd';


export default class Home extends React.Component {
    render() {
        return (
            <div>
                React run wellwdwdw!dwwdwd
                <div className="helloworld">Helloworld</div>
                <img src={image} />
              <Button>123</Button>
            </div>
        )
    }
}
