import {act} from "react-dom/test-utils";
import React from "react";
import {fireEvent, waitFor} from "@testing-library/react";
import ReactDOM from "react-dom/client";
import MockAdapter from "axios-mock-adapter";

import {apiGatewayEndpoint, RegistrationForm} from "./registration-form";
import axios from "axios";

let container: HTMLElement | null = null;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    expectAct()
});

afterEach(() => {
    document.body.removeChild(container!);
    container = null;
});

describe('Should rendered basic html element', () => {
    it('Should rendered health and safety icon', () => {
        expectDataTestId('HealthAndSafetyIcon', new Map<string, string>([["focusable", "false"]]));
    });

    it.each`
        labelId                  | labelInfo  
        ${"register"}            | ${"Register"}
        ${"personalInformation"} | ${"Personal Information"}
        ${"contactInformation"}  | ${"Contact Information"} 
        ${"address"}             | ${"Address"} 
    `('Should render label id: $labelId for info: $labelInfo is', ({labelId, labelInfo}) => {
        expectLabel(labelId, labelInfo)
    });

    it.each`
        inputId        | labelInfo           |  required
        ${"firstName"} | ${"First Name"}     | ${true}
        ${"lastName"}  | ${"Last Name"}      | ${true}
        ${"email"}     | ${"Email Address"}  | ${true}
        ${"npi"}       | ${"NPI Number"}     | ${true}
        ${"phone"}     | ${"Phone Number"}   | ${true}
        ${"address1"}  | ${"Address Line 1"} | ${true}
        ${"address2"}  | ${"Address Line 2"} | ${false}
        ${"city"}      | ${"City"}           | ${false}
        ${"state"}     | ${"State"}          | ${false}
        ${"country"}   | ${"Country"}        | ${true}
        ${"zip"}       | ${"Zip Code"}       | ${true}
    `('Should render label id: inputId for info: $labelInfo is', ({inputId, labelInfo, required}) => {
        expectInput(inputId, labelInfo, required);
    });

    it('Should have rendered submit button', () => {
        expectButton('Register', true)
    });
});

describe('Validating text input fields', () => {
    it.each`
        textInputId    | error                                   | invalidText | validText
        ${"firstName"} | ${"First name must not be empty."}      | ${"    "}   | ${"Prakash"}
        ${"lastName"}  | ${"Last name must not be empty."}       | ${"    "}   | ${"Khadka"}
        ${"npi"}       | ${"Enter a valid 10 digit NPI number"}  | ${"130p"}   | ${"1234567890"}
        ${"phone"}     | ${"Enter a valid phone number"}         | ${"157807"} | ${"+14194077621"}
        ${"email"}     | ${"Enter a valid email address"}        | ${"not"}    | ${"name@domain.com"}
        ${"address1"}  | ${"Address line 1 must not be empty."}  | ${"    "}   | ${"Somewhere"}
        ${"country"}   | ${"Country must not be empty."}         | ${"    "}   | ${"Country"}
        ${"zip"}       | ${"Enter a valid zip"}                  | ${"123"}    | ${"43607"}
    `("Should validate input: $textInputId with errorText: $error", ({textInputId, error, invalidText, validText}) => {
        const input = expectSelectFocus(textInputId)
        expectAct(() => input?.blur());
        expect(input).not.toHaveFocus()
        expectErrorText(textInputId, error);

        expectAct(() => {
            fireEvent.select(input!);
        });
        expect(input).toHaveFocus();
        expectErrorText(textInputId)

        expectAct(() => {
            fireChangeEventWithValue(input, invalidText)
        });
        expect(input).not.toHaveFocus()
        expectErrorText(textInputId, error)

        expectAct(() => {
            fireChangeEventWithValue(input, validText)
        })
        expectErrorText(textInputId)
        expect(input?.getAttribute('value')).toBe(validText)
    });
});

describe('Should validate register button', () => {
    it('Submit button should be disabled for first rendering', () => {
        const submitButton = document.getElementById("submitRegistration");
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).toBeDisabled()
    });

    it('Should simulate disable property of button based on text input property', () => {
        // All required fields are valid except zip
        const {submitButton , zipInput} = expectVisibleButton(true);
        expect(submitButton).toBeDisabled();

        expectAct(() => {
            fireChangeEventWithValue(zipInput, "43607");
        })

        // All required fields are valid
        expect(submitButton).not.toBeDisabled()
    })


    it('Should submit aws api gateway request on visible button is clicked with', async ()  => {
        let mockAxios = new MockAdapter(axios);
        const {submitButton} = expectVisibleButton(false);

        mockAxios.onPost(apiGatewayEndpoint).reply(200, {requestId: "fake-request-id"});

        // Can't use expectAct here, as expectAct is synchronous process and will not wait for all state change event
        // to be capture in act. Either make expectAct to be async and await it for act call back or call act explicitly
        // and await for it.
        await act(async () => {
            fireEvent.click(submitButton!);
        });

        await waitFor(() => {
            expect(mockAxios.history.post[0].url).toBe(apiGatewayEndpoint)
            expect(JSON.parse(mockAxios.history.post[0].data)).toStrictEqual({
                    firstName: "first name",
                    lastname: "last name",
                    npi: "0123456789",
                    phone: "+4194088765",
                    email: "name@domain.com",
                    address1: "1845 some street",
                    address2: "",
                    city: "",
                    country: "Some country",
                    state: "",
                    zip: "43607"
                }
            );

            expectModal('API Gateway Request Id', 'fake-request-id')
        });

        mockAxios.reset()
        mockAxios.onPost(apiGatewayEndpoint).networkErrorOnce();

        await act(async () => {
            fireEvent.click(submitButton!);
        });

        await waitFor(() => {
            expectModal('API Gateway Request Id', 'Unable to post registration')
        });
    });
});

/**
 * Excepts modal with given title to have given description
 *
 * @param title a title of the modal
 * @param description a description of the modal
 */
const expectModal = (title: string, description: string) => {
    expect(document.body?.querySelector('#modal-modal-title')?.textContent).toBe(title);
    expect(document.body?.querySelector('#modal-modal-description')?.textContent).toBe(description);
};

/**
 * Expects the given selector element to be in the document
 *
 * @param selector a selector value
 *
 * @returns the element matching selector
 */
const expectSelector = (selector: string) => {
    const element = document.querySelector(selector);
    expect(element).toBeInTheDocument();
    return element;
}

/**
 * Expects the element with matching data-testid to have given attributes
 *
 * @param testId a data-testid of html element
 * @param attributes a html attributes of the element
 *
 * @returns the matching element matching given data-testid
 */
const expectDataTestId = (testId: string, attributes: Map<string, string> = new Map<string, string>()) => {
    const element = expectSelector(`[data-testid=${testId}]`);
    attributes.forEach((value, key) => {
        expect(element).toHaveAttribute(key, value);
    });
    return element;
}

/**
 * Expects the given html element id label name to match given
 * @param labelId a html element id
 * @param expected an expected value of context text of the element matching given id
 * @param required checks if label is mark required or not
 */
const expectLabel = (labelId: string, expected: string, required: boolean = false) => {
    const element = expectSelector(`#${labelId}`)
    return expectRequired(element, required ? `${expected} *` : expected)
};

/**
 * Expects the given html element input id label name to match given expected value and also see if the input element is
 * required field or not
 *
 * @param inputId an html element input id
 * @param expected an expected label name of element
 * @param required a flag to check if the given field is required field or not
 *
 * @returns last child of the given element parent element
 */
const expectInput = (inputId: String, expected: string, required: boolean = false) => {
    expectLabel(`${inputId}-label`, expected, required)
    const element = expectSelector(`#${inputId}`)
    return expectRequired(element?.parentElement?.lastElementChild, required ? `${expected} *` : expected)
};

/**
 * Expects the given html element text content to match given expected string
 * @param element an element to check
 * @param expected an expected text content
 *
 * @returns the same element
 */
const expectRequired = (element: Element | null | undefined, expected: string) => {
    expect(element?.textContent).toBe(expected)
    return element
};

/**
 * Expects the html button to have given label and checks if it is disabled or not
 * @param expectedLabel an expected label name of button
 * @param disabled checks if button is disabled or not
 */
const expectButton = (expectedLabel: string, disabled: boolean = false) => {
    const button = expectSelector('button')
    if (disabled) {
        expect(button).toBeDisabled()
    }
    else {
        expect(button).not.toBeDisabled()
    }
    expectRequired(button, expectedLabel)
};

/**
 * Expects the given callback to be captured into act
 * @param callback a callback to be run inside act callback
 */
const expectAct = (callback: () => void | undefined = () => ReactDOM.createRoot(container!)?.render(<RegistrationForm />)) => {
    act(() => {
        callback()
    });
    expect(container).toBeTruthy();
};

/**
 * Expects the given html input element id to be focused when firing focus event. This will also expects
 * helper text to be invisible while focusing the element
 * @param textInputId a html input element id
 */
const expectSelectFocus = (textInputId : string) => {
    const input = document.getElementById(textInputId);
    expectAct(() => input?.focus());
    expect(input).toHaveFocus();
    expectErrorText(textInputId);
    let errorText = container?.querySelector(`#${textInputId}-helper-text`);
    expect(errorText).toBeNull();
    return input;
};

/**
 * Expect the text input helper text to match given error if set
 *
 * @param textInputId an id of input text field
 * @param error an error to match inner html for given helper text
 */
const expectErrorText = (textInputId: string, error: string | null = null) => {
    const errorText = container?.querySelector(`#${textInputId}-helper-text`);
    if (!error) {
        expect(errorText).toBeNull();
    }
    else {
        expect(errorText?.innerHTML).toBe(error)
    }
}

/**
 * Fire input change event for given element with target value set to given value first by selecting the element,
 * changing the value and at last sending blur event to element
 *
 * @param element an html element to send fire change events
 * @param value a target value to change with on change event
 */
const fireChangeEventWithValue = (element: HTMLElement | null, value: string) => {
    fireEvent.select(element!)
    fireEvent.change(element!, {target: {value: value}})
    element?.blur()
}

/**
 * Either make registration button visible by entering all inputs with valid input or fail
 * zip input with invalid one
 * @param failOne flag to fail zip input if set to true
 *
 * @returns submit button and zip input html element
 */
const expectVisibleButton = (failOne: boolean) => {
    const submitButton = document.getElementById("submitRegistration");
    const firstNameInput = expectSelectFocus("firstName");
    const lastNameInput = expectSelectFocus("lastName");
    const emailInput = expectSelectFocus("email");
    const npiInput = expectSelectFocus("npi");
    const phoneInput = expectSelectFocus("phone");
    const address1Input = expectSelectFocus("address1");
    const zipInput = expectSelectFocus("zip");
    const countryInput = expectSelectFocus("country");

    expectAct(() => {
        fireChangeEventWithValue(firstNameInput, "first name");
        fireChangeEventWithValue(lastNameInput, "last name");
        fireChangeEventWithValue(emailInput, "name@domain.com");
        fireChangeEventWithValue(npiInput, "0123456789");
        fireChangeEventWithValue(phoneInput, "+4194088765");
        fireChangeEventWithValue(address1Input, "1845 some street");
        fireChangeEventWithValue(countryInput, "Some country");
        fireChangeEventWithValue(zipInput, failOne ? "4360" : "43607");
    });

    return { submitButton, zipInput }
}