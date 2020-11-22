import React from 'react'
import FieldSet from '../../../components/Form/FieldSet'
import TextField from '../../../components/Form/TextField'
import ColorPicker from '../../../components/ColorPicker'
import Button from '../../../components/Button'

function Form() {
    return (
        <form>
            <FieldSet title="Size">
                <TextField name="size" />
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
