import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
// import * as usBankAccountValidator from 'us-bank-account-validator';

/**
 * Password validator. Implements logic for: at least a lowercase character, one uppercase,
 * and a digit.
 * @param {AbstractControl} control
 * @return {ValidationErrors|null}
 */
export function PasswordValidator(control: AbstractControl): ValidationErrors | null {
    const password: string = control.value;
    const failedTasks: { [key: string]: string } = {};

    if (!/[a-z]/.test(password)) {
        failedTasks['lowerChar'] = 'Password must contain at least a lowercase character.';
    }

    if (!/[A-Z]/.test(password)) {
        failedTasks['upperChar'] = 'Password must contain at least an uppercase character.';
    }

    if (!/[0-9]/.test(password)) {
        failedTasks['digit'] = 'Password must contain at least a digit.';
    }

    if (Object.keys(failedTasks).length > 0) {
        return {passwordValidator: failedTasks};
    }

    return null;
}

/**
 * Form wide validator for password confirmation. Optional fields for specifying field names.
 * Defaults to 'password' for the password field and 'confirmPassword' for the confirmation field.
 * @param {string} passField
 * @param {string} passConfirmField
 * @return {ValidatorFn}
 */
export function PasswordMatchValidator(passField: string = 'password', passConfirmField: string = 'confirmPassword'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const password = control.get(passField);
        const confirmPassword = control.get(passConfirmField);

        if (password === undefined || password === null || confirmPassword === undefined || confirmPassword === null) {
            return null;
        }

        if (password.value !== confirmPassword.value) {
            confirmPassword.setErrors({confirmPassword: 'passwords must be identical'});
        } else {
            return null;
        }
    };
}

const mod97 = (s: string): number => {
    let checksum: string | number = s.slice(0, 2);
    let fragment;
    for (let offset = 2; offset < s.length; offset += 7) {
        fragment = String(checksum) + s.substring(offset, offset + 7);
        checksum = parseInt(fragment, 10) % 97;
    }
    return parseInt('' + checksum, 10);
};

/**
 * Simple IBAN validator.
 * @param {AbstractControl} control
 * @return {ValidationErrors | null}
 */
export function IBANValidator(control: AbstractControl): ValidationErrors | null {
    const CODE_LENGTHS = {
        AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
        CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
        FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
        HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
        LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
        MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
        RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26
    };

    const iban = control.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/);

    if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
        return {iban: 'invalid IBAN'};
    }

    const digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter) {
        return letter.charCodeAt(0) - 55;
    });

    return mod97(digits) === 1 ? null : {iban: 'invalid IBAN'};
}

/**
 * US Bank account number validator. Implements Braintree's open sourced validator (https://github.com/braintree/us-bank-account-validator).
 * It only checks for valid length, as they don't limit to digits only.
 * @param {AbstractControl} control
 * @return {ValidationErrors | null}
 */
// export function USBankNumberValidator(control: AbstractControl): ValidationErrors | null {
//     return usBankAccountValidator.accountNumber(control.value).isValid ? null : {usBankNumber: 'US bank number is invalid'};
// }

/**
 * US Bank routing number validator. Implements Braintree's open sourced validator (https://github.com/braintree/us-bank-account-validator).
 * @param {AbstractControl} control
 * @return {ValidationErrors | null}
 */
// export function USBankRoutingValidator(control: AbstractControl): ValidationErrors | null {
//     return usBankAccountValidator.routingNumber(control.value).isValid ? null : {usBankRouting: 'US bank routing number is invalid'};
// }

/**
 * Mutual exclusive validator. Checks if only one of two fields is set.
 * @param {string} first
 * @param {string} second
 * @return {ValidatorFn}
 * @constructor
 */
export function MutualExclusiveValidator(first: string, second: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const firstField = control.get(first);
        const secondField = control.get(second);

        if (firstField === undefined || firstField === null || secondField === undefined || secondField === null) {
            return null;
        }

        let firstFieldErrors = firstField.errors;
        let secondFieldErrors = secondField.errors;

        const hasFirstFieldValue = firstField.value !== undefined && firstField.value !== null,
            hasSecondFieldValue = secondField.value !== undefined && secondField.value !== null;

        if ((firstField.value !== '' && secondField.value === '') || hasFirstFieldValue && !hasSecondFieldValue) {
            if (firstFieldErrors !== null) {
                delete firstFieldErrors.mutualExclusive;
                delete firstFieldErrors.apiError;
                if (Object.keys(firstFieldErrors).length === 0) {
                    firstFieldErrors = null;
                }
                firstField.setErrors(firstFieldErrors);
            }
            secondField.setErrors(null);
            return null;
        }

        if ((firstField.value === '' && secondField.value !== '') ||
            !hasFirstFieldValue && hasSecondFieldValue) {
            if (secondFieldErrors !== null) {
                delete secondFieldErrors.mutualExclusive;
                delete secondFieldErrors.apiError;
                if (Object.keys(secondFieldErrors).length === 0) {
                    secondFieldErrors = null;
                }
                secondField.setErrors(secondFieldErrors);
            }
            firstField.setErrors(null);
            return null;
        }

        firstField.setErrors({mutualExclusive: true});
        secondField.setErrors({mutualExclusive: true});
    };
}

/**
 * IsSSN checks if the provided control offers a valid Social Security Number.
 * @link http://rion.io/2013/09/10/validating-social-security-numbers-through-regular-expressions-2/
 * @param control
 * @return {ValidationErrors|null}
 */
export const IsSSN = (control: AbstractControl): ValidationErrors | null => {
    if (control === undefined || control === null) {
        return null;
    }

    const value: string = control.value;
    if (value === undefined || value === null) {
        return null;
    }

    const ssnPattern: RegExp = /^(?!219-09-9999|078-05-1120)(?!666|000|9\d{2})\d{3}-(?!00)\d{2}-(?!0{4})\d{4}$/;

    if (!ssnPattern.test(value)) {
        return {isSSN: 'invalid ssn'};
    }

    return null;
};
