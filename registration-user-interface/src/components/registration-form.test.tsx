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
    `("Should validate input: textInputId with errorText: $error", ({textInputId, error, invalidText, validText}) => {
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
        let axiosMock = new MockAdapter(axios);
        const {submitButton} = expectVisibleButton(false);

        axiosMock.onPost(apiGatewayEndpoint).reply(200, {requestId: "fake-request-id"});

        await act(async () => {
            fireEvent.click(submitButton!);
        });

        await waitFor(() => {
            expect(axiosMock.history.post[0].url).toBe(apiGatewayEndpoint)
            expect(JSON.parse(axiosMock.history.post[0].data)).toStrictEqual({
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

            expect(document.body?.querySelector('#modal-modal-title')?.textContent).toBe('API Gateway Request Id');
            expect(document.body?.querySelector('#modal-modal-description')?.textContent).toBe('fake-request-id');
        });

        axiosMock.reset()
        axiosMock.onPost(apiGatewayEndpoint).networkErrorOnce();
        await act(async () => {
            fireEvent.click(submitButton!);
        });

        await waitFor(() => {
            expect(document.body?.querySelector('#modal-modal-title')?.textContent).toBe('API Gateway Request Id');
            expect(document.body?.querySelector('#modal-modal-description')?.textContent).toBe('Unable to post registration');
        });
    });
});

const expectSelector = (selector: string) => {
    const element = document.querySelector(selector);
    expect(element).toBeInTheDocument();
    return element;
}

const expectDataTestId = (testId: string, attributes: Map<string, string> = new Map<string, string>()) => {
    const element = expectSelector(`[data-testid=${testId}]`);
    attributes.forEach((value, key) => {
        expect(element).toHaveAttribute(key, value);
    });
    return element;
}

const expectLabel = (labelId: string, expected: string, required: boolean = false) => {
    const element = expectSelector(`#${labelId}`)
    return expectRequired(element, required ? `${expected} *` : expected)
};

const expectInput = (inputId: String, expected: string, required: boolean = false) => {
    expectLabel(`${inputId}-label`, expected, required)
    const element = expectSelector(`#${inputId}`)
    return expectRequired(element?.parentElement?.lastElementChild, required ? `${expected} *` : expected)
};

const expectRequired = (element: Element | null | undefined, expected: string) => {
    expect(element?.textContent).toBe(expected)
    return element
};

const expectButton = (expectedLabel: string, disabled: boolean = false) => {
    const button = expectSelector('button')
    if (disabled) {
        expect(button).toBeDisabled()
    }
    expectRequired(button, expectedLabel)
};

const expectAct = (callback: () => void | undefined = () => ReactDOM.createRoot(container!)?.render(<RegistrationForm />)) => {
    act(() => {
        callback()
    });
    expect(container).toBeTruthy();
};

const expectSelectFocus = (textInputId : string) => {
    const input = document.getElementById(textInputId);
    expectAct(() => input?.focus());
    expect(input).toHaveFocus();
    expectErrorText(textInputId);
    let errorText = container?.querySelector(`#${textInputId}-helper-text`);
    expect(errorText).toBeNull();
    return input;
};

const expectErrorText = (textInput: string, error: string | null = null) => {
    const errorText = container?.querySelector(`#${textInput}-helper-text`);
    if (!error) {
        expect(errorText).toBeNull();
    }
    else {
        expect(errorText?.innerHTML).toBe(error)
    }
}

const fireChangeEventWithValue = (element: HTMLElement | null, value: string) => {
    fireEvent.select(element!)
    fireEvent.change(element!, {target: {value: value}})
    element?.blur()
}

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