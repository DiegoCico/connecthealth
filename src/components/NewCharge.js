import React, {useEffect} from 'react';

export default function NewCharge(props) {
    const { email, name, amount, description } = props
    const createNewCharge = () => {
        const options = {
            method:'POST',
            headers:{accept: 'application/json', 'content-type': 'application/json'},
            body:JSON.stringify({
                amount:amount,
                description:description,
                recipient:email,
                name:name
            })
        }

        fetch('https://sandbox.checkbook.io/v3/invoice', options)
            .then(response => response.json())
            .then(response => console.log(response))
            .catch(err => console.log(err))
    }

    useEffect(() => {
        createNewCharge()
    }, [email, name, amount, description])

    return (
        <div>
            
        </div>
    )
}