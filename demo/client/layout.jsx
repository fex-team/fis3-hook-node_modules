import React from 'react'

export default class LayoutComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        return this.props.children
    }
}