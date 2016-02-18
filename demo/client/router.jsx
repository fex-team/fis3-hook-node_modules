import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'

import Layout from './layout.jsx'
import Home from './routes/home/index.jsx'

const routes = (
    <Router>
        <Route path="/"
               component={Layout}>
            <IndexRoute component={Home}/>
        </Route>
    </Router>
)

export default routes