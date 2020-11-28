import React from 'react'
import FieldSet from '../../../components/Form/FieldSet'
import TextField from '../../../components/Form/TextField'
import ColorPicker from '../../../components/ColorPicker'
import ShapePicker from '../../../components/ShapePicker'
import Button from '../../../components/Button'
import { InlineWrapper } from '../../../components/Wrapper'
import { serializeForm } from '../../../helpers/util'

function Form({ onSubmit, onReset, size }) {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
            <FieldSet title="Shape">
                <ShapePicker />
            </FieldSet>
            <FieldSet>
                <InlineWrapper full>
                    <Button type="button" block onClick={onReset}>Reset</Button>
                    <Button type="submit" block primary>Apply</Button>
                </InlineWrapper>
            </FieldSet>
        </form>
    )
}

export default Form
