import React from 'react'
import FieldSet from '../../../components/Form/FieldSet'
import Checkbox from '../../../components/Form/Checkbox'
import TextField from '../../../components/Form/TextField'

function Form() {
    return (
        <form>
            <FieldSet title="Size">
                <TextField name="size" />
            </FieldSet>
            <FieldSet title="Color">
                <TextField name="color" />
            </FieldSet>
        </form>
    )
}

export default Form
