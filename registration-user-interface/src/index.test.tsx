import React from 'react';
import {Root} from 'react-dom/client';
import {ThemeProvider} from "@emotion/react";
import {muiTheme} from "./theme";
import {CssBaseline} from "@mui/material";
import Application from "./application";

describe("Should mock rendering application", () => {
    const mockRoot: Root =  {
        render: jest.fn(() => {}),
        unmount: jest.fn
    };

    it("ReactDOM should create root and render", () => {
        // Mocks `ReactDOM.createRoot
        jest.mock('react-dom/client', () => ({
            createRoot: jest.fn(() => mockRoot)
        }));

        const spiedRoot = jest.spyOn(mockRoot, 'render');
        // No need to wrap in act here, we are mocking rendering function with jest
        require('./index');
        expect(spiedRoot).toHaveBeenCalledWith(
            <React.StrictMode>
                <ThemeProvider theme={muiTheme}>
                    <CssBaseline />
                    <Application />
                </ThemeProvider>
            </React.StrictMode>
        );
    });
})