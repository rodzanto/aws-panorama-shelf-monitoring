import React from 'react'
import './Card.css'

export default class Card extends React.Component{
    render(){
        return (
            <div className="card">
                <div className="card-logo">
                    <img src={this.props.image} width='100' alt=''/>
                </div>
                <div className="selected">
                  <h1>{this.props.title}</h1>  
                </div>
                <div className="right">
                  <h2 className="card-count">{this.props.count}</h2>
                </div>
            </div>
        )
    }
}