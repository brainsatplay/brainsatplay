#define ASIO_STANDALONE true

#include "brainsatplay.h"
#include <iostream>
#include <json/json.hpp>

using json = nlohmann::json;

// DECLARING VARIABLES
json j2 = {
  {"pi", 3.141},
  {"happy", true},
  {"name", "Niels"},
  {"nothing", nullptr},
  {"answer", {
    {"everything", 42}
  }},
  {"list", {1, 0, 2}},
  {"object", {
    {"currency", "USD"},
    {"value", 42.99}
  }}
};

// void Brainsatplay::test() {
//     std::cout << j2;
// };

// void Brainsatplay::ws() {
//     std::cout << j2;
// };