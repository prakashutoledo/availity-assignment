import React from 'react';
import {Root} from 'react-dom/client';
import {act} from "react-dom/test-utils";
import {ThemeProvider} from "@emotion/react";
import {muiTheme} from "./theme";
import {CssBaseline} from "@mui/material";
import Application from "./application";

const mockRoot: Root =  {
    render: jest.fn(() => {}),
    unmount: jest.fn
}

jest.mock('react-dom/client', () => ({
    createRoot: jest.fn(() => mockRoot)
}))

it("Should run render function", () => {
    act(() => {
        const spiedRoot = jest.spyOn(mockRoot, 'render');
        require('./index')
        expect(spiedRoot).toHaveBeenCalledWith(
            <React.StrictMode>
                <ThemeProvider theme={muiTheme}>
                    <CssBaseline />
                    <Application />
                </ThemeProvider>
            </React.StrictMode>
        )
    })
});