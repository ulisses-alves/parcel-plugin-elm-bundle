module B exposing (main)

import Browser
import Html


main : Program () () ()
main =
    Browser.sandbox
        { init = ()
        , view = \_ -> Html.text ""
        , update = \msg model -> model
        }
