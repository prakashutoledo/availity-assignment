package com.prakashkhadka.validator;

import java.util.Stack;

/**
 * Validator for Lisp code parenthesis
 *
 * @author Prakash Khadka <br>
 *         Created on: May 10, 2022
 */
public class LispParenthesisValidator {
    private static final LispParenthesisValidator VALIDATOR = new LispParenthesisValidator();
    private static final char START_PARENTHESIS = '(';
    private static final char END_PARENTHESIS = ')';
    private static final char SINGLE_LINE_COMMENT = ';';
    private static final char ESCAPE_CHAR = '\\';
    private static final char NEW_LINE = '\n';
    private static final char MULTI_LINE_COMMENT_SHARP = '#';
    private static final char MULTI_LINE_COMMENT_PIPE = '|';

    /**
     * Validates the given Lisp expression if parenthesis is complete
     *
     * @param expression a Lisp expression to validate
     *
     * @return {@code true} if parenthesis in the given expression is properly closed and complete
     *         otherwise {@code false}
     */
    public static boolean validate(String expression) {
        return VALIDATOR.test(expression);
    }

    private LispParenthesisValidator() {
        // private instantiation
    }


    /**
     * Checks if the given Lisp expression is closed and nested. This will ignore the expression in valid single line
     * and multiline Lisp comment convention. Uses Stack to track the parenthesis (push when start and pop when end),
     * until all the character in the given expression is evaluated, it will check if the stack is empty or not. If
     * stack is empty then the given Lisp expression is mark closed and nested.
     *
     * Space Complexity: O(p) where p is the number of start parenthesis in the given expression
     * Time Complexity: O(n) where n is the size of given expression
     *
     * @param expression a Lisp code to check
     * @return {@code true} if closed and nested otherwise {@code false}
     */
    private boolean test(String expression) {
        if (expression == null || expression.isBlank()) {
            return false;
        }

        Stack<Character> stack = new Stack<>();
        int size = expression.length();
        for(int i = 0; i < size; i++) {
            char currentCharacter = expression.charAt(i);

            switch (currentCharacter) {
                case START_PARENTHESIS:
                    stack.push(currentCharacter);
                    break;

                case END_PARENTHESIS:
                    if (stack.isEmpty()) {
                        return false;
                    }
                    stack.pop();
                    break;

                case ESCAPE_CHAR:
                    i++;
                    break;

                case MULTI_LINE_COMMENT_SHARP:
                    if (++i >= size) {
                        return false;
                    }
                    if (expression.charAt(i) == MULTI_LINE_COMMENT_PIPE) {
                        if (++i >= size) {
                            return false;
                        }

                        while(expression.charAt(i) != MULTI_LINE_COMMENT_PIPE) {
                            if (++i >= size) {
                                return false;
                            }
                        }

                        if (++i >= size) {
                            return false;
                        }

                        if (expression.charAt(i) != MULTI_LINE_COMMENT_SHARP) {
                            return false;
                        }
                    }
                    break;

                case SINGLE_LINE_COMMENT:
                    if (++i < size) {
                        while(expression.charAt(i) !=  NEW_LINE) {
                            if (++i >= expression.length()) {
                                break;
                            }
                        }
                    }
            }
        }
        return stack.isEmpty();
    }
}
