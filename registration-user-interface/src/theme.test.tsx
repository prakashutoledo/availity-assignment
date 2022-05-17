import { createTheme } from "@mui/material/styles";
import {muiTheme} from './theme';

it('Should have mui theme set', () => {
    expect(muiTheme).not.toBeNull()
    expect(muiTheme).not.toBeFalsy()
    expect(muiTheme.toString()).toBe(createTheme().toString())
});
