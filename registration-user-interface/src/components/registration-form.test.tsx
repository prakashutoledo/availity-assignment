import {act} from "react-dom/test-utils";
import React from "react";
import {fireEvent, waitFor} from "@testing-library/react";
import ReactDOM from "react-dom/client";
import MockAdapter from "axios-mock-adapter";

import {RegistrationForm} from "./registration-form";
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
        expectRegisterButton(true)
    });
});

describe('Validating text input fields', () => {
    it.each`
        textInputId    | error                                    | invalidText | validText
        ${"firstName"} | ${"First name must not be empty."}       | ${"    "}   | ${"Prakash"}
        ${"lastName"}  | ${"Last name must not be empty."}        | ${"    "}   | ${"Khadka"}
        ${"npi"}       | ${"Enter a valid 10 digit NPI number"}   | ${"130p"}   | ${"1234567890"}
        ${"phone"}     | ${"Enter a valid 10 digit phone number"} | ${"157807"} | ${"+14194077621"}
        ${"email"}     | ${"Enter a valid email address"}         | ${"not"}    | ${"name@domain.com"}
        ${"address1"}  | ${"Address line 1 must not be empty."}   | ${"    "}   | ${"Somewhere"}
        ${"country"}   | ${"Country must not be empty."}          | ${"    "}   | ${"Country"}
        ${"zip"}       | ${"Enter a valid zip"}                   | ${"123"}    | ${"43607"}
    `("Should validate input: $textInputId with errorText: $error", ({textInputId, error, invalidText, validText}) => {
        const input = expectSelectFocus(textInputId, true)
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
        expect(input).toHaveValue(validText)
    });
});

describe('Should validate register button', () => {
    let mockAxios: MockAdapter;
    const apiGatewayEndpoint: string = 'https://some-fake-api'
    beforeAll(() => mockAxios = new MockAdapter(axios))

    afterEach(() => mockAxios.reset())

    it('Should simulate disable property of button based on text input property', () => {
        // All required fields are valid except zip
        const {zip} = expectVisibleButton(true);
        expectRegisterButton(true)

        expectAct(() => {
            fireChangeEventWithValue(zip, "43607");
        })

        // All required fields are valid
        expectRegisterButton()
    })

    it('Should submit aws api gateway request with success request id description', async () => {
        // Mock actual request
        mockAxios.onPost(apiGatewayEndpoint).reply(200, {requestId: "fake-request-id"});
        // Should open dialog
        await expectDialog('fake-request-id')

        // Wait for dialog close by invoking close icon
        await act(async () => {
            fireEvent.click(expectSelector('#apigateway-request-dialog-close')!)
        });
    });

    it('Should submit aws api gateway request with dialog network error description', async () => {
        mockAxios.onPost(apiGatewayEndpoint).networkErrorOnce()
        // Should open dialog
        await expectDialog('Unable to post registration')

        // Wait for dialog close by invoking close icon
        await act(async () => {
            fireEvent.click(expectSelector('#apigateway-request-dialog-close')!)
        });
    });

    it('Should close dialog and empty all the inputs on close icon clicked event', async () => {
        mockAxios.onPost(apiGatewayEndpoint).reply(200, {requestId: "fake-request-id-2"});
        const submitButton = await expectDialog('fake-request-id-2')

        // Wait for dialog close by invoking close icon
        await act(async () => {
            fireEvent.click(expectSelector('#apigateway-request-dialog-close')!)
        });

        // Should disable the registration button and should empty all input
        await waitFor(() => {
            expect(submitButton).toBeDisabled();
            expectEmptyInputs();
        })
    });

    /**
     * Excepts dialog with given title to have given description
     *
     * @param description a description of the modal
     */
    const expectDialog = async (description: string) => {
        const {submitButton} = expectVisibleButton(false);

        // Can't use expectAct here, as expectAct is synchronous process and will not wait for all state change event
        // to be capture in act. Either make expectAct to be async and await it for act call back or call act explicitly
        // and await for it.
        await act(async () => {
            fireEvent.click(submitButton!);
        });

        expect(mockAxios.history.post[0].url).toBe(apiGatewayEndpoint)
        expect(JSON.parse(mockAxios.history.post[0].data)).toStrictEqual({
            firstName: "first name",
            lastname: "last name",
            npi: "0123456789",
            phone: "+4194088765",
            email: "name@domain.com",
            address1: "1845 some street",
            address2: "address 2",
            city: "Some city",
            country: "Some country",
            state: "Some state",
            zip: "43607"
        });

        await act(async () => {
            fireEvent.click(submitButton!);
        });

        await waitFor(() => {
            expect(document.getElementById('api-gateway-request-dialog-title')?.textContent).toBe('API Gateway Request Id');
            expect(document.getElementById('api-gateway-request-dialog-description')?.textContent).toBe(description);
        });

        return submitButton
    };
});

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
 *
 * @param labelId a html element id
 * @param expected an expected value of context text of the element matching given id
 * @param required checks if label is mark required or not
 *
 * @returns the html element with that label id
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
 * @param disabled checks if button is disabled or not
 */
const expectRegisterButton = (disabled: boolean = false) => {
    const registerButton = expectSelector('#submitRegistration')
    if (disabled) {
        expect(registerButton).toBeDisabled()
    } else {
        expect(registerButton).not.toBeDisabled()
    }
    expectRequired(registerButton, 'Register')
};

/**
 * Expects the given callback to be captured into act
 * @param callback a callback to be run inside act callback
 */
const expectAct = (callback: () => void | undefined = () => ReactDOM.createRoot(container!)?.render(
    <RegistrationForm/>)) => {
    act(callback);
    expect(container).toBeTruthy();
};

/**
 * Expects the given html input element id to be focused when firing focus event. This will also expects
 * helper text to be invisible while focusing the element
 *
 * @param textInputId a html input element id
 * @param checkFocus a flag to check focus property of the given input element
 *
 * @returns the text field input with given id
 */
const expectSelectFocus = (textInputId: string, checkFocus: boolean = false) => {
    const input = document.getElementById(textInputId);
    if (checkFocus) {
        expectAct(() => input?.focus());
        expect(input).toHaveFocus();
        expectErrorText(textInputId);
        let errorText = container?.querySelector(`#${textInputId}-helper-text`);
        expect(errorText).toBeNull();
    }
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
    } else {
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
    const submitButton = document.getElementById('submitRegistration')
    const textInputs = {...inputs()};

    expectAct(() => {
        fireChangeEventWithValue(textInputs.firstName, "first name");
        fireChangeEventWithValue(textInputs.lastName, "last name");
        fireChangeEventWithValue(textInputs.email, "name@domain.com");
        fireChangeEventWithValue(textInputs.npi, "0123456789");
        fireChangeEventWithValue(textInputs.phone, "+4194088765");
        fireChangeEventWithValue(textInputs.address1, "1845 some street");
        fireChangeEventWithValue(textInputs.address2, "address 2");
        fireChangeEventWithValue(textInputs.country, "Some country");
        fireChangeEventWithValue(textInputs.city, "Some city");
        fireChangeEventWithValue(textInputs.state, "Some state");
        fireChangeEventWithValue(textInputs.zip, failOne ? "4360" : "43607");
    });

    return {submitButton, ['zip']: textInputs.zip}
}

/**
 * Expects all the text field input value to be empty string
 */
const expectEmptyInputs = () => {
    Object.entries(inputs()).forEach(([, input]) => {
        expect(input).toHaveValue("")
    })
}

/**
 * Get all the text field inputs
 *
 * @returns all available text field input
 */
const inputs = () => {
    const firstName = expectSelectFocus("firstName");
    const lastName = expectSelectFocus("lastName");
    const email = expectSelectFocus("email");
    const npi = expectSelectFocus("npi");
    const phone = expectSelectFocus("phone");
    const address1 = expectSelectFocus("address1");
    const address2 = expectSelectFocus('address2')
    const city = expectSelectFocus('city')
    const state = expectSelectFocus('state')
    const zip = expectSelectFocus("zip");
    const country = expectSelectFocus("country");

    return {
        firstName, lastName, email, npi, phone, address1, address2, city, state, zip, country
    }
}