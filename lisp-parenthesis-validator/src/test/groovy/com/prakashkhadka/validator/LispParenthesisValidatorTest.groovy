package com.prakashkhadka.validator

import static org.junit.jupiter.api.Assertions.assertFalse
import static org.junit.jupiter.api.Assertions.assertTrue

import spock.lang.Specification
import spock.lang.Unroll

/**
 * Spock specification for {@Link LispParenthesisValidator}
 *
 * @author Prakash Khadka <br>
 *         Created on: May 10, 2022
 */
class LispParenthesisValidatorTest extends Specification {

    @Unroll
    def 'Input lisp code `#expression` has valid parenthesis'() {
        when: 'Given Lisp code expression are validated'
            def validation = LispParenthesisValidator.validate(expression)

        then: 'Lisp expression have valid parenthesis'
            assertTrue validation, "Valid parenthesis"

        where: 'Input expression are'
            expression                                                | _
            '#| |#'                                                   | _
            ';'                                                       | _
            ';        '                                               | _
            ';       \n'                                              | _
            "(mapcar #'+ '(1 2 3 4 5) '(10 20 30 40 50))"             | _
            ";(mapcar #'+ '(1 2 3 4 5) '(10 20 30 40 50))"            | _
            """|#|
               |;(mapcar #'+ '(1 2 3 4 5) '(10 20 30 40 50))"
               ||#
            """.stripIndent().stripMargin()                           | _
            """|(defun factorial (n)
               |    (if (zerop n) 1
               |        (* n (factorial (1- n)))))
            """.stripIndent().stripMargin()                           | _
            '(or (and "zero" nil "never") "James" \'task \'time)'     | _
            '((lambda (arg) (+ arg 1)) 5)'                            | _
            "(setf (fdefinition 'f) #'(lambda (a) (block f b...)))"   | _
            """|(let ((stuff (should-be-constant)))                   
               |(setf (third stuff) 'bizarre)) 
            """.stripIndent().stripMargin()                           | _
            """|(write-line "Semicolon in string\\;")
               |(write-line "Groovy testing\\\\")
               |;single Semicolon comment
               |;; double Semicolon comment
               |;;; triple Semicolon comment
               |#| 
               |multiline comment
               ||#
               |(write-line "Welcome to \\"Groovy Testing\\"")
            """.stripIndent().stripMargin()                           | _
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
               """.stripIndent().stripMargin()                        | _
    }

    @Unroll
    def 'Input lisp code `#expression` has invalid parenthesis'() {
        when: 'Given Lisp code expression are validated'
            def validationResult = LispParenthesisValidator.validate(expression)

        then: 'Lisp expression should not have valid parenthesis'
            assertFalse validationResult, "Invalid parenthesis"

        where: 'Input expression are'
            expression                                 | _
            null                                       | _
            ''                                         | _
            '   '                                      | _
            '('                                        | _
            '(()'                                      | _
            '#|  '                                     | _
            '#|   \n'                                  | _
            "(reduce #'-"                              | _
            """|(reduce #'-
               |    reverse (list 1 2 3)))
            """.stripMargin().stripIndent()            | _
            """|#|
               |(reduce #'-
               |    (reverse (list 1 2 3)))
            """.stripIndent().stripMargin()            | _
    }
}
