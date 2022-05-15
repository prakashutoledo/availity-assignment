package com.prakashkhadka.processor

import static org.junit.jupiter.api.Assertions.assertEquals
import static org.junit.jupiter.api.Assertions.assertTrue

import spock.lang.Specification
import spock.lang.TempDir
import spock.lang.Unroll

import java.nio.file.Files
import java.nio.file.Path

/**
 * Spock specification for {@link CsvEnrollmentProcessor}
 *
 * @author Prakash Khadka <br>
 *         Created on: May 11, 2022
 */
class CsvEnrollmentProcessorTest extends Specification {
    @TempDir
    private Path temporaryDirectoryPath

    def 'Processing csv string path `#filePath` is failed because of `#reason`'() {
        when: 'Input csv file path is processed'
            CsvEnrollmentProcessor.processFile((String) filePath)

        then: 'Should throw IllegalArgumentException'
            def exception = thrown IllegalArgumentException

        and: 'Should match exception message'
            assertEquals "Invalid filename", exception.message, reason

        where: 'Input csv file path with exception reason are'
            filePath         || reason
            ''               || 'Empty file path'
            '   '            || 'Blank file path'
            null             || 'Null file path'
            'testable'       || 'Path without extension'
            'testable.excel' || 'Path other than .csv extension'
    }

    def 'Processing csv path `#filePath` is failed because of `#reason`'() {
        when: 'Input csv file path is processed'
            CsvEnrollmentProcessor.processFile((Path) filePath)

        then: 'Should throw IllegalArgumentException'
            def exception = thrown IllegalArgumentException

        and: 'Should match exception message'
            assertEquals "Invalid file path", exception.message, reason

        where: 'Input csv file path with exception reason are'
            filePath                           || reason
            Path.of("non-existing-file")       || 'File path without extension'
            Path.of("non-existing-file.excel") || 'File path other than .csv extension'
            Path.of("non-existing-file.csv")   || "File path doesn't exists"
            null                               || 'Null path'
    }

    @Unroll
    def 'Processing unsupported operation during runtime for valid file name without valid contents'() {
        given: 'Invalid csv contents written into csv file'
            def absoluteCsvPath = writeCsvContents 'test', csvContents

        when: 'Given csv file path is processed for enrollment'
            CsvEnrollmentProcessor.processFile absoluteCsvPath

        then: 'Thrown Exception'
            thrown UncheckedIOException

        where: 'Invalid csv contents input are'
            csvContents                                           | _
            """|userId,firstName,lastName,version,insuranceCompany
               |test1,test2,test3,test4,test5
            """.stripIndent().stripMargin().trim()                | _

    }

    def 'Processing valid csv string file path'() {
        given: 'Valid csv file path'
            def csvContents = """
                                |userId,firstName,lastName,version,insuranceCompany
                                |1,firstName1,lastName1,1,company1
                                |1,firstName1,lastName1,2,company1
                                |2,firstName10,lastName10,10,company3
                                |3,firstName9,lastName9,9,company3
                                |3,firstName9,lastName9,8,company3
                                |4,firstName8,lastName8,6,company3
                                |2,firstName2,lastName2,10,company2
                                |2,firstName2,lastName2,8,company2
                                |2,firstName2,lastName2,11,company2
                                |0,firstName0,lastName0,1,company2
                                |21,firstName21,lastName21,21,company1
                                |46,firstName46,lastName46,46,company2
                              """.stripIndent().stripMargin().trim()
            def absoluteCsvPath = writeCsvContents 'test', csvContents

        when: 'Given csv file path is processed for enrollment'
            CsvEnrollmentProcessor.processFile absoluteCsvPath.toString()

        then: 'Should create csv file for company 1'
            def company1CsvContents =
                    """
                      |userId,firstName,lastName,version,insuranceCompany
                      |1,firstName1,lastName1,2,company1
                      |21,firstName21,lastName21,21,company1
                    """.stripMargin().stripIndent().trim()
            validateCsvContents 'company1', company1CsvContents

        and: 'Should create csv file for company 2'
            def company2CsvContents =
                    """
                      |userId,firstName,lastName,version,insuranceCompany
                      |0,firstName0,lastName0,1,company2
                      |2,firstName2,lastName2,11,company2
                      |46,firstName46,lastName46,46,company2
                    """.stripMargin().stripIndent().trim()
            validateCsvContents 'company2', company2CsvContents

        and: 'Should create csv file for company 3'
            def company3CsvContents =
                    """
                      |userId,firstName,lastName,version,insuranceCompany
                      |2,firstName10,lastName10,10,company3
                      |4,firstName8,lastName8,6,company3
                      |3,firstName9,lastName9,9,company3
                    """.stripMargin().stripIndent().trim()
            validateCsvContents 'company3', company3CsvContents
    }

    def 'Processing valid csv file path'() {
        given: 'Valid csv file path'
            def csvContents =
                    """
                      |userId,firstName,lastName,version,insuranceCompany
                      |1,John,Shelby,1,CompanyX
                      |1,John,Shelby,2,CompanyX
                      |33,Haily,Shell,33,CompanyX
                      |2,Paul,Ryan,10,CompanyZ
                      |3,Sydney,White,9,CompanyZ
                      |3,Sydney,White,8,CompanyZ
                      |4,Tessa,Shetty,6,CompanyZ
                      |2,Tom,Hawk,10,CompanyY
                      |2,Tom,Hawk,8,CompanyY
                      |2,Tom,Hawk,11,CompanyY
                      |32,Raheem,Sterling,1,CompanyY
                      |24,Frank,Lampard,24,CompanyX
                      |46,Eden,Hazard,46,CompanyY
                      |1,John,Shelby,2,CompanyX
                    """.stripIndent().stripMargin().trim()
            def absoluteCsvPath = writeCsvContents 'test', csvContents

        when: 'Given csv file path is processed for enrollment'
            CsvEnrollmentProcessor.processFile absoluteCsvPath

        then: 'Should create csv file for company X'
            def companyXCsvContents =
                    """
                      |userId,firstName,lastName,version,insuranceCompany
                      |24,Frank,Lampard,24,CompanyX
                      |1,John,Shelby,2,CompanyX
                      |33,Haily,Shell,33,CompanyX
                    """.stripMargin().stripIndent().trim()
            validateCsvContents 'CompanyX', companyXCsvContents

        and: 'Should create csv file for company Y'
            def companyYCsvContents =
                    """
                      |userId,firstName,lastName,version,insuranceCompany
                      |2,Tom,Hawk,11,CompanyY
                      |46,Eden,Hazard,46,CompanyY
                      |32,Raheem,Sterling,1,CompanyY
                    """.stripMargin().stripIndent().trim()
            validateCsvContents 'CompanyY', companyYCsvContents

        and: 'Should create csv file for company Z'
            def companyZCsvContents =
                    """
                      |userId,firstName,lastName,version,insuranceCompany
                      |2,Paul,Ryan,10,CompanyZ
                      |4,Tessa,Shetty,6,CompanyZ
                      |3,Sydney,White,9,CompanyZ
                    """.stripMargin().stripIndent().trim()
            validateCsvContents 'CompanyZ', companyZCsvContents
    }

    private Path writeCsvContents(String fileName, String csvContents) {
        return Files.writeString(Path.of(temporaryDirectoryPath.toString(), "${fileName}.csv"), csvContents)
    }

    /**
     * Validates the csv contents for the given company in temporary directory path
     *
     * @param fileName a name of file in csv format
     * @param expectedCsvContents an expected CSV contents to match
     */
    private void validateCsvContents(String fileName, String expectedCsvContents) {
        def actualPath = Path.of temporaryDirectoryPath.toString(), "${fileName}.csv"
        assertTrue Files.exists(actualPath), 'File do exists'
        assertEquals expectedCsvContents, Files.readString(actualPath).trim(), "Csv contents are matched"
    }
}
