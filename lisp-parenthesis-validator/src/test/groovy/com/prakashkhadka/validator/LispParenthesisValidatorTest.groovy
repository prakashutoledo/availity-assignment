package com.prakashkhadka.validator

import static org.junit.jupiter.api.Assertions.assertFalse
import static org.junit.jupiter.api.Assertions.assertTrue

import spock.lang.Specification
import spock.lang.Unroll

/**
 * Spock specification for {@link LispParenthesisValidator}
 *
 * @author Prakash Khadka <br>
 *         Created on: May 10, 2022
 */
class LispParenthesisValidatorTest extends Specification {

    @Unroll
    def 'Input lisp code \n#expression\nhas valid parenthesis because of `#validationSuccessReason`'() {
        when: 'Lisp code expression are validated'
            def validation = LispParenthesisValidator.validate expression

        then: 'Lisp expression should have closed parenthesis with validation success reason'
            assertTrue validation, validationSuccessReason

        where: 'Input expression are'
            expression                                              || validationSuccessReason
            '#| |#'                                                 || 'Valid Lisp multiline comment (expression inside is ignored)'
            ';'                                                     || 'Valid Lisp single line comment (expression inside is ignored)'
            ';        '                                             || 'Valid Lisp single line comment (expression inside is ignored)'
            ';       \n'                                            || 'Valid Lisp single line comment (expression inside is ignored)'
            "(mapcar #'+ '(1 2 3 4 5) '(10 20 30 40 50))"           || 'Valid Lisp code with parenthesis closed and enclosed'
            ";(mapcar #'+ '(1 2 3 4 5) '(10 20 30 40 50))"          || 'Valid Lisp single line comment (expression inside is ignored)'
            """|#|
               |;(mapcar #'+ '(1 2 3 4 5) '(10 20 30 40 50))"
               ||#
            """.stripIndent().stripMargin().trim()                  || 'Valid Lisp multiline comment (expression inside is ignored)'
            """|(defun factorial (n)
               |    (if (zerop n) 1
               |        (* n (factorial (1- n)))))
            """.stripIndent().stripMargin().trim()                  || 'Valid Lisp code with parenthesis closed and enclosed'
            '(or (and "zero" nil "never") "James" \'task \'time)'   || 'Valid Lisp code with parenthesis closed and enclosed'
            '((lambda (arg) (+ arg 1)) 5)'                          || 'Valid Lisp code with parenthesis closed and enclosed'
            "(setf (fdefinition 'f) #'(lambda (a) (block f b...)))" || 'Valid Lisp code with parenthesis closed and enclosed'
            """|(let ((stuff (should-be-constant)))                   
               |(setf (third stuff) 'bizarre)) 
            """.stripIndent().stripMargin().trim()                  || 'Valid Lisp code with parenthesis closed and enclosed'
            """|(write-line "Semicolon in string\\;")
               |(write-line "Groovy testing\\\\")
               |;single Semicolon comment
               |;; double Semicolon comment
               |;;; triple Semicolon comment
               |#| 
               |multiline comment
               ||#
               |(write-line "Welcome to \\"Groovy Testing\\"")
            """.stripIndent().stripMargin().trim()                  || """|Valid Lisp code with parenthesis closed and enclosed
                                                                          |Valid Lisp line comment (expression inside is ignored)
                                                                          |Valid Lisp multi line comment (expression inside is ignored)
                                                                       """.stripIndent().stripMargin().trim()
            """|(defclass book ()
               |  ((title :reader book-title
               |          :initarg :title)
               |   (author :reader book-author
               |           :initarg :author))
               |  (:documentation "Describes a book."))
               |
               |(make-instance 'book
               |               :title "ANSI Common Lisp"
               |               :author "Paul Graham")
            """.stripIndent().stripMargin().trim()                  || 'Valid Lisp code with parenthesis closed and enclosed'
    }

    @Unroll
    def 'Input lisp code \n#expression\nhas invalid parenthesis because of `#failedValidationResult`'() {
        when: 'Lisp code expression are validated'
            def validationResult = LispParenthesisValidator.validate expression

        then: 'Lisp expression should not have valid parenthesis with failed validation reason'
            assertFalse validationResult, failedValidationResult

        where: 'Input expression are'
            expression                                     || failedValidationResult
            null                                           || 'Null Lisp code is invalid'
            ''                                             || 'Empty Lisp code is count invalid'
            '   '                                          || 'Blank Lisp code is count invalid'
            '('                                            || 'Incomplete parenthesis in Lisp code'
            '(()'                                          || 'Incomplete parenthesis in Lisp code'
            '#'                                            || 'Invalid multiline comment in Lisp code'
            '#|'                                           || 'Incomplete multiline comment in Lisp code'
            '#| '                                          || 'Incomplete multiline comment in Lisp code'
            '#|  '                                         || 'Incomplete multiline comment in Lisp code'
            '#|   \n'                                      || 'Incomplete multiline comment in Lisp code'
            '#|   |'                                       || 'Incomplete multiline comment in Lisp code'
            '#|   | '                                      || 'Incomplete multiline comment in Lisp code'
            "(reduce #'-"                                  || 'Incomplete parenthesis in Lisp code'
            """|(reduce #'-
               |    reverse (list 1 2 3)))
            """.stripMargin().stripIndent().trim()         || 'Incomplete parenthesis in Lisp code'
            """|#|
               |(reduce #'-
               |    (reverse (list 1 2 3)))
            """.stripIndent().stripMargin().trim()         || """|Incomplete multiline comment in Lisp code
                                                                 |(Ignored expression inside it, even though it is 
                                                                 | valid expression)
                                                              """.stripMargin().stripIndent().trim()
    }
}
