import React from 'react'
import FieldSet from '../../../components/Form/FieldSet'
import TextField from '../../../components/Form/TextField'
import ColorPicker from '../../../components/ColorPicker'
import Button from '../../../components/Button'
import { serializeForm } from '../../../helpers/util'

function Form({ onSubmit, size }) {
    function handleSubmit(e) {
        e.preventDefault();

        onSubmit && onSubmit(serializeForm(e.currentTarget))
    }

    return (
        <form onSubmit={handleSubmit}>
            <FieldSet title="Size">
                <TextField name="size" defaultValue={size} />
            </FieldSet>
            <FieldSet title="Color">
                <ColorPicker />
            </FieldSet>
            <FieldSet>
                <Button type="submit" block primary>Apply</Button>
            </FieldSet>
        </form>
    )
}

export default Form
