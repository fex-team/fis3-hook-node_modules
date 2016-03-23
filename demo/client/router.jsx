import React from 'react'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'

import Layout from './layout.jsx'
import Home from './routes/home/index.jsx'

const routes = (
    <Router history={hashHistory}>
        <Route path="/"
               component={Layout}>
            <IndexRoute component={Home}/>
        </Route>
    </Router>
)

export default routes