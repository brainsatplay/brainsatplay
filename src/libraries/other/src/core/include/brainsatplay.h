#pragma once


// class Brainsatplay {
//     public:
//         void test();
// };

/* This ifdef allows the header to be used from both C and C++. */
#ifdef __cplusplus
extern "C" {
#endif
int createClient(int, const char**);
#ifdef __cplusplus
} //end extern "C"
#endif
