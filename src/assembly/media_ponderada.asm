.data
	bl:		.asciiz "\n"
	i:		.word 0
	grade:		.word 0
	weight:		.word 0
	grade_acumulator:		.word 0
	weight_acumulator:		.word 0
	final_grade:		.word 0
	text0:		.asciiz "Digite a "
	text1:		.asciiz "a nota: "
	text2:		.asciiz "Digite o "
	text3:		.asciiz "o peso: "
	text4:		.asciiz "A media ponderada e: "

.text
main:
# Line 8 - Assignment 
addi $s7, $zero, 1
sw $s7, i

# Line 9 - Assignment 
addi $s7, $zero, 0
sw $s7, grade_acumulator

# Line 10 - Assignment 
addi $s7, $zero, 0
sw $s7, weight_acumulator

# Line 11 - While 
lw $s7, i
addi $s6, $zero, 3
ble $s7, $s6, while0
j endWhile0

while0:
# Line 12 - Output 
la $a0, text0
jal printText
jal breakLine

# Line 13 - Output 
lw $a0, i
jal printValue
jal breakLine

# Line 14 - Output 
la $a0, text1
jal printText
jal breakLine

# Line 15 - Input 
jal userInput
sw $v0, grade
jal breakLine

# Line 16 - Output 
la $a0, text2
jal printText
jal breakLine

# Line 17 - Output 
lw $a0, i
jal printValue
jal breakLine

# Line 18 - Output 
la $a0, text3
jal printText
jal breakLine

# Line 19 - Input 
jal userInput
sw $v0, weight
jal breakLine

# Line 20 - Assignment 
lw $s7, grade
lw $s6, weight
mul $t0, $s7, $s6

# Line 21 - Assignment 
lw $s7, grade_acumulator
add $s7, $s7, $t0
sw $s7, grade_acumulator

# Line 22 - Assignment 
lw $s7, weight_acumulator
lw $s6, weight
add $s7, $s7, $s6
sw $s7, weight_acumulator

# Line 23 - Assignment 
lw $s7, i
add $s7, $s7, 1
sw $s7, i

# Line 24 - End while 
lw $s7, i
addi $s6, $zero, 3
ble $s7, $s6, while0

endWhile0:
# Line 25 - Assignment 
lw $s7, grade_acumulator
lw $s6, weight_acumulator
div $s7, $s6
mflo $s7
sw $s7, final_grade

# Line 26 - Output 
la $a0, text4
jal printText
jal breakLine

# Line 27 - Output 
lw $a0, final_grade
jal printValue
jal breakLine

j finishProgram

printValue:
li $v0, 1
syscall
jr $ra

printText:
li $v0, 4
syscall
jr $ra

userInput:
li $v0, 5
syscall
jr $ra

breakLine:
li $v0, 4
la $a0, bl
syscall
jr $ra

finishProgram:
li $v0, 10
syscall

