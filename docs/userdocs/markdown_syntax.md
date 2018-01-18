# Markdown Syntax

## Bold, Underline, and Strikethrough

To make text **bold,** put two asterisks or two underscores on each side. To
make text _italic,_ put one asterisk or one underscore on each side. To add a
~~strikethrough~~ effect, put two tildes on each side.

### Example

    **This text is bold.**
    _This text is italic._
    **_This text is both!_**
    ~~This~~ That is how you do strikethrough.

**This text is bold.**
_This text is italic._
**_This text is both!_**
~~This~~ That is how you do strikethrough.

## Headers
There are two ways to create headers. The easiest is to add hashtags at the
beginning of the line. Note that up to six levels of headers are used, even
though the editor only has buttons for three of them.

### Example

    # Header 1
    ## Header 2
    ### Header 3
    #### Header 4
    ##### Header 5
    ###### Header 6

::: headercontainer
# Header 1
## Header 2
### Header 3
#### Header 4
##### Header 5
###### Header 6
:::

## Quotes
To make a paragraph a quote, start it with a greater-than sign.


    > "Not every quote on the Internet is true, or
    even attributed to the right
    person." -- Albert Einstein


> "Not every quote on the Internet is true, or even attributed to the right
person." -- Albert Einstein

## Numbered and Bullet Lists
Numbered lists are easy: simply start each item with the number, followed by a
period. Note that Markdown automatically corrects the numbering when you leave
Edit Mode.

### Example

    1. Item A
    2. Item B
    2. Item C
    5. Item D

1. Item A
2. Item B
2. Item C
5. Item D

Bullet lists are similar, but each item starts with a dash, plus sign, or
asterisk.

### Example

    - Cats
    - Dogs
    - Fish

- Cats
- Dogs
- Fish

## Emoji
Most common emoticons are automatically converted into emoji. For example, `:-)`
becomes :-) and `:/` becomes :/.

For other emoji, write the name of the emoji between two colons.

### Example

    I <3 openworldcrafter, but I need :coffee: to write :books:.

I <3 openworldcrafter, but I need :coffee: to write :books:.

## Spoilers
Spoilers are hidden until you roll your mouse over them (or, on mobile, tap
them). This can help prevent casual shoulder-surfing.

### Example

    ::: spoiler
    Everybody dies at the end!
    :::

::: spoiler
Everybody dies at the end!
:::
